@extends('layout.pos')

@section('title', 'VNT Pos - Phòng\Bàn')

@section('content')
    @push('css')
        <link rel="stylesheet" href="{{ asset('css/pos/table.css') }}">
    @endpush

    <div class="room-table-page">
        <div class="layout">

            <!-- ==== SIDEBAR LEFT ==== -->
            <div class="sidebar">
                <!-- Box: Khu vực -->
                    <div class="box">
                        <div class="box-title">
                            <span>Khu vực</span>
                            @can('create_area')
                                <button type="button" class="add-area-btn">+</button>
                            @endcan
                        </div>

                        <div class="custom-dropdown" id="areaDropdown">
                            <div class="selected-display">
                                <span id="currentValue">-- Tất cả --</span>
                                <i class="fa-solid fa-chevron-down arrow-icon"></i>
                            </div>
                            
                            <ul class="dropdown-list">
                                <li data-value="">-- Tất cả --</li>
                                @foreach($areas as $area)
                                    <li data-value="{{ $area->id }}">{{ $area->name }}</li>
                                @endforeach
                            </ul>
                            
                            <input type="hidden" name="area_id" id="areaSelect">
                            @can('update_area')
                            <i class="fa-regular fa-pen-to-square edit-icon d-none" id="editAreaBtn"></i>
                            @endcan
                        </div>
                    </div>
                    
                    <!-- Box: Tìm kiếm -->
                        <div class="box">
                            <div class="box-title">Tìm kiếm</div>
                            <input
                                type="text"
                                class="input-text"
                                id="table-search"
                                placeholder="Theo tên phòng/bàn"
                            >
                        </div>

                    <!-- Box: Trạng thái -->
                    <div class="box status-box">
                        <div class="box-title">Trạng thái 
                            <span class="status-arrow"></span>
                        </div>

                        <div class="status-content">
                            <label class="radio-item">
                                <input type="radio" name="status" value="all" checked>
                                <span>Tất cả</span>
                            </label>

                            <label class="radio-item">
                                <input type="radio" name="status" value="active">
                                <span>Đang hoạt động</span>
                            </label>

                            <label class="radio-item">
                                <input type="radio" name="status" value="inactive">
                                <span>Dừng hoạt động</span>
                            </label>
                        </div>
                    </div>
            </div>

            <!-- ==== MAIN CONTENT RIGHT ==== -->
            <div class="main-content">
                <div class="header-row">
                    <h2>Phòng/Bàn</h2>
                    @can('create_table')
                        <button class="btn-create"><i class="far fa-plus"></i> Thêm Phòng/Bàn </button>
                    @endcan
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tên phòng/bàn</th>
                            <th>Khu vực</th>
                            <th>Trạng thái</th>
                            <th>Số thứ tự</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($tables as $tb)
                            <tr class="table-info" data-id="{{ $tb->id }}" data-area="{{ $tb->area_id }}"
                                data-status="{{ $tb->status }}" data-name="{{ strtolower($tb->name) }}" data-area-name="{{ strtolower($tb->area->name ?? '') }}">
                                <td>{{ $tb->name }}</td>
                                <td>{{ $tb->area->name ?? '---' }}</td>
                                <td>{{ $tb->status == 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động' }}</td>
                                <td>{{ $tb->id }}</td>
                            </tr>
                            <tr class="detail-row" id="detail-{{ $tb->id }}" style="display:none;">
                                <td colspan="6">
                                    <div class="detail-content">
                                        <div class="field">
                                            <div class="field-label">Tên phòng bàn:</div>
                                            <div class="field-value">{{ $tb->name }}</div>
                                        </div>
                                        <div class="field">
                                            <div class="field-label">Khu vực:</div>
                                            <div class="field-value">{{ $tb->area->name ?? '---' }}</div>
                                        </div>
                                    </div>
                                    <!-- Nút -->
                                    <div class="detail-actions">
                                        @can('update_table')
                                            <a href="#" class="btn tb-update"><i class="fa fa-check-square"></i> Cập nhật</a>
                                        @endcan
                                        @can('update_status_table')
                                            <a href="#" class="btn tb-status" data-status="{{ $tb->status }}"><i class="fa fa-lock"></i> Ngừng hoạt động</a>
                                        @endcan
                                        @can('delete_table')
                                            <a href="#" class="btn tb-delete"><i class="far fa-trash-alt"></i> Xoá</a>
                                        @endcan
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
                <div class="table-pagination" id="pagination">
                    <button id="prevPage" class="page-btn">
                        <i class="fas fa-chevron-left"></i>
                    </button>

                    <span id="pageInfo"></span>

                    <button id="nextPage" class="page-btn">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- FORM ADD EDIT DELETE AREA START -->
    <!-- Overlay nền mờ -->
    <div id="popup-overlay" class="popup-overlay"></div>
    <!-- Popup form -->
    <div id="popup-add-area" class="popup-box">
        <h2>Thêm Khu Vực</h2>
        <label>Tên khu vực</label>
        <input type="text" id="area-name" placeholder="Nhập tên khu vực...">
        <div class="popup-actions">
            @canany(['create_area', 'update_area'])
                <button id="save-popup" class="btn-save" type="button"><i class="fas fa-save"></i> Lưu</button>
            @endcanany
            <button id="cancel-popup" class="btn-cancel" type="button"><i class="fas fa-ban"></i> Hủy</button>
            @can('delete_area')
                <button id="delete-popup" class="btn-delete" type="button"><i class="far fa-trash-alt"></i> Xóa</button>
            @endcan
        </div>
    </div>
    <!-- FORM ADD EDIT DELETE AREA END -->

    <!-- FORM ADD & EDIT & DELETE TABLE START -->
    <div id="tableFormOverlay" class="overlay">
        <div class="modal">
            <div class="modal-header">
                <h3 id="formTitle">Thêm phòng/bàn</h3>
                <button id="btnCloseHeader" class="close-btn">×</button>
            </div>
            <!-- TAB: THÔNG TIN -->
            <form id="tableInfoForm">
                <input type="hidden" id="table_id">
                <div class="form-group">
                    <label>Tên phòng/bàn</label>
                    <input class="write" type="text" name="name" id="table_name">
                </div>

                <div class="form-group">
                    <label>Khu vực</label>
                    <select class="choose" name="area_id" id="area_id">
                    <option value="">-- Lựa chọn --</option>
                    @foreach($areas as $area) 
                    <option value="{{ $area->id }}">{{ $area->name }}</option>
                    @endforeach
                    </select>
                </div>

                <div class="form-actions">
                    @canany(['create_table', 'update_table'])
                        <button id="table-save" class="table-save" type="button"><i class="fas fa-save"></i> Lưu</button>
                    @endcanany
                    <button id="cancelBtn" class="table-cancel" type="button"><i class="fas fa-ban"></i> Hủy</button>
                </div>
            </form>
        </div>
    </div>
  <!-- FORM ADD & EDIT & DELETE TABLE END -->
@endsection

@push('js')
    <script>
        window.routes = {
            baseUrl: "{{ url('') }}",

            area: {
                store: "{{ route('area.store') }}"
            },

            table: {
                store: "{{ route('table.store') }}"
            }
        };
    </script>
    <script src="{{ asset('js/pos/table.js') }}"></script>
@endpush