@extends('layout.pos')

@section('title', 'VNT Pos - Nhân Viên')

@section('content')
    @push('css')
        <link rel="stylesheet" href="{{ asset('css/pos/staff.css') }}">
    @endpush

    <meta name="csrf-token" content="{{ csrf_token() }}" data-store-url="{{ route('role.store') }}" >

    <!-- CONTENT START --> 
    <div class="staff-page"> 
        <div class="layout"> 
            <!-- ==== SIDEBAR LEFT ==== --> 
            <div class="sidebar"> 
                    <!-- Box: Tìm kiếm --> 
                    <div class="box">
                        <div class="box-title">Tìm kiếm</div>
                        <input
                            type="text"
                            class="input-text"
                            name="q"
                            value="{{ request('q') }}"
                            placeholder="Theo mã, tên nhân viên"
                        >
                    </div>

                    <!-- Box: Trạng thái --> 
                    <div class="box status-box"> 
                        <div class="box-title">Trạng thái 
                            <span class="status-arrow"></span> 
                        </div> 
                        <div class="status-content">
                            <label class="radio-item"> 
                                <input type="radio" name="status" value="active">
                                <span>Đang làm việc</span>
                            </label> 
                            <label class="radio-item"> 
                                <input type="radio" name="status" value="inactive">
                                <span>Đã nghỉ</span>
                            </label> 
                        </div> 
                    </div> 

                    <!-- Box: Chức vụ -->
                    <div class="box"> 
                        <div class="box-title"> 
                            <span>Chức vụ</span> 
                            <button type="button" class="add-role-btn">+</button> 
                        </div> 

                        <div class="role-select-wrapper" id="roleWrapper">
                            <div class="custom-dropdown" id="roleDropdown">
                                <div class="selected-display">
                                    <span id="currentRoleText">-- Tất cả --</span>
                                    <i class="fa-solid fa-chevron-down arrow-icon"></i>
                                </div>
                                <ul class="dropdown-list">
                                    <li data-value="">-- Tất cả --</li>
                                    @foreach($roles as $role)
                                        <li data-value="{{ $role->id }}">{{ $role->name }}</li>
                                    @endforeach
                                </ul>
                                <input type="hidden" id="filter-role" name="role_id">
                            </div>

                            <i class="fa-regular fa-pen-to-square edit-icon d-none" id="editRoleBtn"></i>
                        </div>
                    </div>
            </div> 
            <!-- ==== MAIN CONTENT RIGHT ==== --> 
            <div class="main-content"> 
                <div class="header-row"> 
                    <h2>Danh sách nhân viên</h2> 
                    <button class="btn-create"><i class="far fa-plus"></i> Thêm Nhân Viên</button>
                </div> 
                <table class="data-table"> 
                    <thead> 
                        <tr class="list-data"> 
                            <th>Ảnh</th> 
                            <th>Mã nhân viên</th> 
                            <th>Tên nhân viên</th> 
                            <th>Số điện thoại</th> 
                            <th>Chức danh</th> 
                        </tr> 
                    </thead> 
                    <tbody> 
                        <!-- Ví dụ --> 
                        @foreach($staff as $s)
                            <tr class="staff-info" data-id="{{ $s->id }}" data-code="{{ strtolower($s->code) }}" 
                                data-name="{{ strtolower($s->name) }}"
                                data-status="{{ strtolower($s->status) }}" data-role="{{ $s->role_id }}">
                                <td class="staff-img">
                                    <img 
                                        src="{{ $s->img 
                                                ? asset('images/staff/'.$s->img) 
                                                : asset('images/staff/default-staff.png') }}" 
                                        class="staff-img"
                                        alt="Ảnh nhân viên">
                                </td>
                                <td class="staff-code">{{ $s->code }}</td>
                                <td class="staff-name">{{ $s->name }}</td>
                                <td>{{ $s->phone }}</td>
                                <td>{{ $s->role->name ?? 'Không rõ' }}</td>
                            </tr>
                            <!-- Row chi tiết (ẩn) -->
                            <tr class="detail-row" id="detail-{{ $s->id }}" style="display:none;">
                                <td class="detail-td" colspan="6">
                                    <div class="detail-content">
                                        <!-- Ảnh -->
                                        <div class="detail-col pic">
                                            <img src="{{ asset('images/staff/' . ($s->img ?? 'default-staff.png')) }}" class="detail-img">
                                        </div>
                                        <!-- Thông tin -->
                                        <div class="detail-col info">

                                            <!-- Dòng 1 -->
                                            <div class="row">
                                                <div class="field">
                                                    <div class="field-label">Mã nhân viên</div>
                                                    <div class="field-value">{{ $s->code }}</div>
                                                </div>

                                                <div class="field">
                                                    <div class="field-label">Tên nhân viên</div>
                                                    <div class="field-value">{{ $s->name }}</div>
                                                </div>

                                                <div class="field">
                                                    <div class="field-label">Chức danh</div>
                                                    <div class="field-value">{{ $s->role->name ?? 'none' }}</div>
                                                </div>
                                            </div>

                                            <!-- Dòng 2 -->
                                            <div class="row">
                                                <div class="field">
                                                    <div class="field-label">Số CCCD</div>
                                                    <div class="field-value">{{ $s->cccd }}</div>
                                                </div>

                                                <div class="field">
                                                    <div class="field-label">Số điện thoại</div>
                                                    <div class="field-value">{{ $s->phone }}</div>
                                                </div>

                                                <div class="field">
                                                    <div class="field-label">Email</div>
                                                    <div class="field-value">{{ $s->email }}</div>
                                                </div>
                                            </div>

                                            <!-- Dòng 3 -->
                                            <div class="row">
                                                <div class="field">
                                                    <div class="field-label">Giới tính</div>
                                                    <div class="field-value">{{ $s->gender }}</div>
                                                </div>

                                                <div class="field">
                                                    <div class="field-label">Ngày sinh</div>
                                                    <div class="field-value">{{ $s->dob?->format('Y-m-d') }}</div>
                                                </div>

                                                <div class="field">
                                                    <div class="field-label">Ngày bắt đầu làm việc</div>
                                                    <div class="field-value">{{ $s->start_date?->format('Y-m-d') }}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Nút -->
                                    <div class="detail-actions">
                                        <a href="#" class="btn btn-update"><i class="fa fa-check-square"></i> Cập nhật</a>
                                        <a href="#" class="btn btn-status"><i class="fa fa-user-slash"></i> Ngừng làm việc</a>
                                        <a href="#" class="btn btn-delete"><i class="far fa-trash-alt"></i> Xoá nhân viên</a>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody> 
                </table> 
            <div class="staff-pagination" id="pagination">
                <button id="prevPage" class="page-btn"><i class="fas fa-chevron-left"></i></button>
                <span id="pageInfo"></span>
                <button id="nextPage" class="page-btn"><i class="fas fa-chevron-right"></i></button>
            </div>
            </div> 
        </div>    
    </div> 

    <!-- FORM ADD NEW CATEGORY START -->
        <!-- Overlay nền mờ -->
        <div id="popup-overlay" class="popup-overlay"></div>
        <!-- Popup form -->
        <div id="popup-add-role" class="popup-box">
            <h2>Thêm Chức Vụ</h2>
            <label>Tên chức vụ</label>
            <input type="text" id="role-name" placeholder="Nhập tên khu vực...">
            <div class="popup-actions">
                <button id="save-popup" class="btn-save" type="button"><i class="fas fa-save"></i> Lưu</button>
                <button id="cancel-popup" class="btn-cancel" type="button"><i class="fas fa-ban"></i> Hủy</button>
                <button id="delete-popup" class="btn-delete" type="button"><i class="far fa-trash-alt"></i> Xóa</button>
            </div>
        </div>
    <!-- FORM ADD NEW CATEGORY END -->

    <!-- FORM ADD & EDIT & DELETE STAFF START -->
    <div class="staff-overlay" id="staffForm">
        <div class="staff-modal">
            <!-- HEADER -->
            <div class="staff-header">
                <h2 id="formTitle">Thêm mới nhân viên</h2>
                <button id="btnCloseHeader" class="close-btn">×</button>
            </div>

            <!-- TAB -->
            <div class="staff-tabs">
                <button class="staff-tab active" data-tab="info">Thông tin</button>
                <button class="staff-tab" data-tab="salary">Bảng Lương</button>
            </div>

            <!-- TAB 1: THÔNG TIN NHÂN VIÊN -->
            <div class="tab-content active" id="tab-info">
                <form id="staffInfoForm">
                    <input type="hidden" id="staff_id">

                    <div class="info-wrapper" style="display:flex; gap:20px;">
                        <!-- RIGHT: IMAGE UPLOAD -->
                        <div class="staff-left" style="width:160px; text-align:center;">

                            <div class="image-upload-wrap" style="display:flex; flex-direction:column; align-items:center;">
                                
                                <div id="imageBox" class="image-box"
                                    style="width:200px; height:200px; border:1px dashed #999; border-radius:6px;
                                            display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                    
                                    <img id="previewImage" src="" alt=""
                                        style="width:100%; height:100%; object-fit:cover; display:none;">

                                    <span class="add-text" id="addText">Chưa có ảnh</span>

                                    <button id="removeImageBtn" class="remove-btn"
                                            style="display:none; position:absolute; margin-top:-180px; margin-left:160px;">
                                        ✖
                                    </button>
                                </div>

                                <!-- BUTTON CHOOSE FILE -->
                                <button type="button" id="btnChooseImage" class="staff-save"
                                        style="margin-top:10px; padding:8px 16px;">
                                    Chọn ảnh
                                </button>

                                <input type="file" id="imageInput" accept="image/*" hidden>
                                <input type="hidden" id="delete_image" name="delete_image" value="0">
                            </div>
                        </div>

                        <!-- LEFT: FORM INPUT -->
                        <div class="staff-rigt" style="flex:3;">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Mã nhân viên</label>
                                    <input type="text" name="code" id="staff_code" disabled placeholder="Mã nhân viên tự động">
                                </div>
                                <div class="form-group">
                                    <label>Tên nhân viên</label>
                                    <input type="text" name="name" id="staff_name">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Chức vụ</label>
                                    <select name="role_id" id="role_id">
                                        <option value="">Chọn chức vụ</option>
                                        @foreach($roles as $role)
                                            <option value="{{ $role->id }}">{{ $role->name }}</option>
                                        @endforeach
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>CCCD</label>
                                    <input type="text" name="cccd" id="cccd">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Số điện thoại</label>
                                    <input type="text" name="phone" id="phone">
                                </div>

                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" id="email" autocomplete="username">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Giới tính</label>
                                    <select name="gender" id="gender">
                                        <option value="">Chọn giới tính</option>
                                        <option value="nam">Nam</option>
                                        <option value="nữ">Nữ</option>
                                        <option value="khác">Khác</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label>Ngày sinh</label>
                                    <input type="date" name="dob" id="dob">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Ngày bắt đầu làm việc</label>
                                    <input type="date" name="start_date" id="start_date">
                                </div>

                                <div class="form-group">
                                    <label>Password</label>
                                    <input type="password" name="password" id="password" autocomplete="current-password">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- FOOTER TAB 1 -->
                    <div class="staff-footer">
                        <button id="save-popup" class="staff-save" type="button">
                            <i class="fas fa-save"></i> Lưu
                        </button>
                        <button id="cancelBtn" class="staff-cancel" type="button">
                            <i class="fas fa-ban"></i> Hủy
                        </button>
                    </div>

                </form>
            </div>

            <!-- TAB 2: LƯƠNG -->
            <div class="tab-content" id="tab-salary">
                <form id="staffSalaryForm">

                    <div class="ingredient-search">
                        <input type="text" placeholder="Tìm nguyên liệu..." id="ingredientSearch">
                        <div id="ingredientSuggest" class="suggest-box"></div>
                    </div>

                    <table class="ingredient-table">
                        <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã</th>
                            <th>Tên nguyên liệu</th>
                            <th>Định lượng</th>
                            <th>Giá vốn</th>
                            <th>Thành tiền</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody id="ingredientList"></tbody>
                    </table>

                    <div class="form-actions">
                        <button id="btnSaveSalary" class="staff-save" type="button">
                            <i class="fas fa-save"></i> Lưu
                        </button>
                        <button id="btnCancelSalary" class="staff-cancel" type="button">
                            <i class="fas fa-ban"></i> Hủy
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </div>
    <!-- FORM ADD & EDIT & DELETE INGREDIENT END -->
@endsection

@push('js')
    <script>
        window.routes = {
            baseUrl: "{{ url('') }}",

        role: {
            store: "{{ route('role.store') }}",
            update: "{{ route('role.update', ':id') }}",
            delete: "{{ route('role.delete', ':id') }}"
        },

            staff: {
                store: "{{ route('staff.store') }}"
            }
        };
    </script>
    <script src="{{ asset('js/pos/staff.js') }}"></script>
@endpush