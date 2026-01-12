@extends('layout.pos')

@section('title', 'VNT Pos - Quản lý khuyến mại')

@section('content')
    @push('css')
        <link rel="stylesheet" href="{{ asset('css/pos/promotion.css') }}">
    @endpush

        <div class="promotion-page">
        <!-- ===== LEFT SIDEBAR ===== -->
        <div class="sidebar">

            <!-- TÌM KIẾM -->
            <div class="box">
                <div class="box-title">Tìm kiếm</div>
                <input type="text" placeholder="Theo mã khuyến mãi" class="search-input">
                <input type="text" placeholder="Theo tên chương trình" class="search-input">
            </div>

            <!-- TRẠNG THÁI  -->
            <div class="box collapsible">
                <div class="box-title">
                    Trạng thái
                    <span class="arrow"></span>
                </div>

                <label class="radio-item">
                    <input type="radio" name="status" value="all" checked>
                    <span>Tất cả</span>
                </label>

                <label class="radio-item">
                    <input type="radio" name="status" value="active">
                    <span>Còn hạn</span>
                </label>

                <label class="radio-item">
                    <input type="radio" name="status" value="expired">
                    <span>Hết hạn</span>
                </label>
            </div>

            <div class="box"> 
                <div class="box-title"> 
                    <span>Loại chương trình</span> 
                    @can('create_promotion_type')
                        <button type="button" class="add-type-btn">+</button> 
                    @endcan
                </div> 
                <div class="type-select-wrapper" id="typeWrapper">
                    <div class="custom-dropdown" id="typeDropdown">
                        <div class="selected-display">
                            <span id="currentTypeText">-- Tất cả --</span>
                            <i class="fa-solid fa-chevron-down arrow-icon"></i>
                        </div>
                        <ul class="dropdown-list">
                            <li data-value="">-- Tất cả --</li>
                            @foreach($types as $type)
                                <li data-value="{{ $type->id }}" data-code="{{ $type->code }}" 
                                    data-name="{{ $type->name }}" data-description="{{ $type->description }}">
                                    {{ $type->name }}</li>
                            @endforeach
                        </ul>
                        <input type="hidden" id="filter-type" name="type_id">
                    </div>
                    <i class="fa-regular fa-pen-to-square edit-icon d-none" id="editTypeBtn"></i>
                </div>
            </div>
        </div>

        <!-- ===== RIGHT CONTENT ===== -->
        <div class="content">
            <div class="content-header">
                <h2>Danh sách chương trình</h2>
                @can('create_promotion')
                    <button class="btn-create"><i class="far fa-plus"></i> Tạo chương trình</button>
                @endcan
            </div>

            <table class="promotion-table">
                <thead>
                    <tr>
                        <th>Mã chương trình</th>
                        <th>Chi nhánh áp dụng</th>
                        <th>Loại chương trình</th>
                        <th>Tên chương trình</th>
                        <th>Giảm giá</th>
                        <th>Ghi chú</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                    </tr>
                </thead>

                <tbody>
                    <!-- DỮ LIỆU -->
                    @foreach($promotions as $promotion)
                        <tr class="promotion-info" data-id="{{ $promotion->id }}" 
                            data-name="{{ strtolower($promotion->name) }}" data-type="{{ $promotion->type_id }}"
                            data-description="{{ $promotion->description }}" 
                            data-discount="{{ (int)$promotion->discount == $promotion->discount ? (int)$promotion->discount : $promotion->discount }}"
                            data-time="{{ strtotime($promotion->created_at) }}">
                            <td>{{ $promotion->code }}</td>
                            <td>{{ $promotion->location->name }}</td>
                            <td>{{ $promotion->type->name }}</td>
                            <td>{{ $promotion->name }}</td>
                            <td>{{ rtrim(rtrim(number_format($promotion->discount, 2, '.', ''), '0'), '.') }}</td>
                            <td>{{ $promotion->description }}</td>
                            <td>{{ $promotion->start_date }}</td>
                            <td>{{ $promotion->end_date }}</td>
                    @endforeach
                </tbody>
            </table>
            <div class="promotion-pagination" id="pagination">
                <button id="prevPage" class="page-btn"><i class="fas fa-chevron-left"></i></button>
                <span id="pageInfo"></span>
                <button id="nextPage" class="page-btn"><i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
    </div>

    <!-- ===== MODAL ADD PROMOTION ===== -->
    <div class="modal promotion-modal" id="addPromotionModal" style="display:none;">
        <div class="modal-content promotion-modal-content">
            <div class="modal-header promotion-modal-header">
                <h3>Tạo chương trình khuyến mãi</h3>
                <span class="close-btn promotion-close-btn" id="closePromotionModal">&times;</span>
            </div>
            <div class="modal-body promotion-modal-body">
                <form method="POST" action="{{ route('promotion.store') }}">
                    @csrf

                    <div class="form-group">
                        <label for="name">Tên chương trình</label>
                        <input type="text" id="name" name="name" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="type_id">Loại chương trình</label>
                        <select id="type_id" name="type_id" class="form-control" required>
                            <option value="">-- Chọn loại --</option>
                            @foreach($types as $type)
                                <option value="{{ $type->id }}">{{ $type->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="location_id">Địa điểm áp dụng</label>
                        <select id="location_id" name="location_id" class="form-control" required>
                            <option value="">-- Chọn địa điểm --</option>
                            @foreach($locations as $location)
                                <option value="{{ $location->id }}">{{ $location->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="discount">Giá trị khuyến mãi</label>
                        <input type="number" step="0.01" id="discount" name="discount" class="form-control">
                    </div>

                    <div class="form-group">
                        <label for="description">Mô tả</label>
                        <textarea id="description" name="description" class="form-control"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="start_date">Ngày bắt đầu</label>
                        <input type="date" id="start_date" name="start_date" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="end_date">Ngày kết thúc</label>
                        <input type="date" id="end_date" name="end_date" class="form-control">
                    </div>
                    @can('update_promotion')
                        <button type="submit" class="btn-submit promotion-submit-btn"><i class="fas fa-save"></i> Lưu </button>
                    @endcan
                    <button id="cancelBtn" class="promotion-cancel" type="button"><i class="fas fa-ban"></i> Hủy</button>
                    @can('delete_promotion')
                        <button id="deletePromotionBtn" class="btn-delete" type="button" style="display:none;"> <i class="far fa-trash-alt"></i> Xóa </button>
                    @endcan
                </form>
            </div>
        </div>
    </div>



    <!-- ===== MODAL ADD TYPE PROMOTION ===== -->
    <div class="modal type-modal" id="addTypeModal" style="display:none;">
        <div class="modal-content type-modal-content">
            <div class="modal-header type-modal-header">
                <h3>Thêm loại khuyến mãi</h3>
                <span class="close-btn type-close-btn" id="closeTypeModal">&times;</span>
            </div>
            <div class="modal-body type-modal-body">
                <form id="addTypeForm" method="POST" action="{{ route('promotion_type.store') }}">
                    @csrf
                    <div class="form-group">
                        <label for="code">Mã loại</label>
                        <input type="text" id="code" name="code" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="name">Tên loại</label>
                        <input type="text" id="name" name="name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="description">Mô tả</label>
                        <textarea id="description" name="description" class="form-control"></textarea>
                    </div>
                    @can('create_promotion_type')
                        <button type="submit" class="btn-submit type-submit-btn"> <i class="fas fa-save"></i> Lưu</button>
                    @endcan
                    <button id="cancel-popup" class="btn-cancel" type="button"><i class="fas fa-ban"></i> Hủy</button>
                    @can('delete_promotion_type')
                        <button id="delete-popup" class="btn-delete" type="button" style="display: none;"><i class="far fa-trash-alt"></i> Xóa</button>
                    @endcan
                </form>
            </div>
        </div>
    </div>


    @endsection

@push('js')
    <script src="{{ asset('js/pos/promotion.js') }}"></script>
@endpush