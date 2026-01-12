@extends('layout.pos')

@section('title', 'VNT Pos - Khách hàng')

@section('content')
    @push('css')
        <link rel="stylesheet" href="{{ asset('css/pos/customer.css') }}">
    @endpush
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- CONTENT START --> 
    <div class="customer-page"> 
        <div class="layout"> 
            <!-- ==== SIDEBAR LEFT ==== --> 
            <div class="sidebar"> 
                <!-- 🔍 TÌM KIẾM -->
                <div class="box">
                    <div class="box-title">Tìm kiếm</div>
                    <input type="text" id="searchCode" placeholder="Theo mã khách hàng" class="search-input">
                    <input type="text" id="searchName" placeholder="Theo tên khách hàng" class="search-input">
                    <input type="text" id="searchPhone" placeholder="Theo số điện thoại" class="search-input">
                </div>
            </div> 
            <!-- ==== MAIN CONTENT RIGHT ==== --> 
            <div class="main-content"> 
                <div class="header-row"> 
                    <h2>Khách hàng</h2> 
                    @can('create_customer')
                        <button class="btn-create"><i class="far fa-plus"></i> Thêm khách hàng</button>
                    @endcan
                </div> 
                <table class="data-table"> 
                    <thead> 
                        <tr class="list-data"> 
                            <th>Mã khách hàng</th> 
                            <th>Tên khách hàng</th> 
                            <th>Số điện thoại</th> 
                        </tr> 
                    </thead> 
                    <tbody> 
                        <!-- Ví dụ --> 
                        @foreach($customer as $cus)
                            <tr class="customer-info" data-id="{{ $cus->id }}" data-code="{{ strtolower($cus->code) }}" 
                                data-name="{{ strtolower($cus->name) }}" data-phone="{{ $cus->phone }}">
                                <td class="customer-code">{{ $cus->code }}</td>
                                <td class="customer-name">{{ $cus->name }}</td>
                                <td>{{ $cus->phone }}</td>
                            </tr>
                            <!-- Row chi tiết (ẩn) -->
                            <tr class="detail-row" id="detail-{{ $cus->id }}" style="display:none;">
                                <td class="detail-td" colspan="6">
                                    <div class="detail-content">
                                        <!-- Thông tin -->
                                        <div class="detail-col info">
                                            <!-- Dòng 1 -->
                                            <div class="row">
                                                <div class="field">
                                                    <div class="field-label">Mã khách hàng</div>
                                                    <div class="field-value">{{ $cus->code }}</div>
                                                </div>

                                                <div class="field">
                                                    <div class="field-label">Tên khách hàng</div>
                                                    <div class="field-value">{{ $cus->name }}</div>
                                                </div>

                                                <div class="field">
                                                    <div class="field-label">số điện thoại</div>
                                                    <div class="field-value">{{ $cus->phone }}</div>
                                                </div>
                                            </div>

                                            <!-- Dòng 2 -->
                                            <div class="row">
                                                <div class="field">
                                                    <div class="field-label">Ngày sinh</div>
                                                    <div class="field-value">{{ $cus->dob?->format('Y-m-d') }}</div>
                                                </div>

                                                <div class="field">
                                                    <div class="field-label">Giới tính</div>
                                                    <div class="field-value">{{ $cus->gender }}</div>
                                                </div>

                                                <div class="field">
                                                    <div class="field-label">Email</div>
                                                    <div class="field-value">{{ $cus->email }}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Nút -->
                                    <div class="detail-actions">
                                        @can('update_customer')
                                            <a href="#" class="btn btn-update"><i class="fa fa-check-square"></i> Cập nhật</a>
                                        @endcan
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody> 
                </table> 
            <div class="customer-pagination" id="pagination">
                <button id="prevPage" class="page-btn"><i class="fas fa-chevron-left"></i></button>
                <span id="pageInfo"></span>
                <button id="nextPage" class="page-btn"><i class="fas fa-chevron-right"></i></button>
            </div>
            </div> 
        </div>    
    </div> 

    <!-- FORM ADD & EDIT CUSTOMER START -->
    <div id="customerFormOverlay" class="overlay">
        <div class="modal">
            <div class="modal-header">
                <h3 id="formTitle">Thêm khách hàng</h3>
                <button id="btnCloseHeader" class="close-btn">×</button>
            </div>
            <!-- THÔNG TIN -->
            <form id="customerInfoForm">
                <input type="hidden" id="table_id">
                <div class="customer-rigt" style="flex:3;">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Mã khách hàng</label>
                            <input type="text" name="code" id="customer_code" disabled placeholder="Mã khách hàng tự động">
                        </div>
                        <div class="form-group">
                            <label>Tên khách hàng</label>
                            <input type="text" name="name" id="customer_name">
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
                </div>

            <div class="form-actions">
                <button id="cus-save" class="cus-save" type="button"><i class="fas fa-save"></i> Lưu</button>
                <button id="cancelBtn" class="cus-cancel" type="button"><i class="fas fa-ban"></i> Hủy</button>
            </div>
            </form>
        </div>
    </div>
  <!-- FORM ADD & EDIT & DELETE TABLE END -->
@endsection

@push('js')
    <script>
        const CUSTOMER_STORE_URL = "{{ route('customer.store') }}";
    </script>
    <script src="{{ asset('js/pos/customer.js') }}"></script>
@endpush