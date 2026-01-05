<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="base-url" content="{{ url('/') }}">
        <meta name="checkout-url" content="{{ route('pos.checkout') }}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <meta name="search-product-url" content="{{ route('pos.search.product') }}">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <link rel="shortcut icon" href="{{ asset('favicon-pos.ico') }}">
        <link rel="stylesheet" href="{{ asset('css/pos/cashier.css') }}">
        <title>Tới Bến Quán - Thu Ngân</title>
    </head>
    <body>
        <div class="cashier-wrapper">
            <!-- LEFT PANEL -->
            <div class="left-panel">
                <!-- TOP NAV -->
                <div class="top-nav">
                    <ul class="nav-tabs">
                        <li>
                            <a href="" data-tab="tables">
                                <span>Phòng Bàn</span>
                            </a>
                        </li>
                        <li>
                            <a href="" data-tab="menu">
                                <span>Thực Đơn</span>
                            </a>
                        </li>
                        <li>
                            <a href="" data-tab="booking">
                                <span>Đặt Trước</span>
                            </a>
                        </li>
                    </ul>

                    <div class="search-box">
                        <input type="text" class="search-input" placeholder="Tìm món">
                        <div class="search-result" id="searchResult"></div>
                    </div>
                </div>

                <!-- TABLE TAB -->
                <div class="tab-content tables active" id="tab-tables">
                    <div class="area-filter">
                        <div class="group-all">
                            <a href="#" data-area="all" class="area-link active">Tất cả</a>
                        </div>
                        <ul class="nav-area">
                            @foreach($areas as $area)
                                <li>
                                    <a href="#" data-area="{{ $area->id }}" class="area-link">
                                        {{ $area->name }}
                                    </a>
                                </li>
                            @endforeach
                        </ul>
                    </div>

                    <div class="status-filter">
                        <div class="status-content">
                            <label class="radio-item">
                                <input type="radio" name="status" value="all" checked>
                                <span>Tất cả</span>
                            </label>

                            <label class="radio-item">
                                <input type="radio" name="status" value="active">
                                <span>Đang sử dụng</span>
                            </label>

                            <label class="radio-item">
                                <input type="radio" name="status" value="inactive">
                                <span>Còn trống</span>
                            </label>
                        </div>
                    </div>

                    <div class="table-grid" id="tableGrid">
                        @foreach($tables as $table)
                            <div class="table-item item-to-paginate" 
                                data-id="{{ $table->id }}" data-area-id="{{ $table->area_id }}" 
                                data-area-name="{{ $table->area->name ?? '' }}" data-name="{{ $table->name }}">
                                <span>{{ $table->name }}</span>
                            </div>
                        @endforeach
                    </div>
                    <div class="booking-pagination" id="pagination-tables">
                        <button class="page-btn prev-btn"><i class="fas fa-chevron-left"></i></button>
                        <span class="page-info"></span>
                        <button class="page-btn next-btn"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>

                <!-- MENU TAB -->
                <div class="tab-content menu" id="tab-menu">
                    <div class="category-bar">
                        <ul class="nav-category">
                            <li>
                                <a href="#" data-category="all" class="category-link active">Tất cả</a>
                            </li>
                            @foreach($categories as $category)
                                <li>
                                    <a href="#" data-category="{{ $category->id }}" class="category-link">
                                        {{ $category->name }}
                                    </a>
                                </li>
                            @endforeach
                        </ul>
                    </div>

                    <div class="menu-grid item-to-paginate">
                        @foreach($products as $product)
                            <div class="menu-item" data-category="{{ $product->category_id }}" data-name="{{ strtolower($product->name) }}" 
                                data-type="{{ $product->type_menu }}" data-id="{{ $product->id }}" 
                                data-price="{{ $product->price }}" data-unit="{{ $product->unit }}">
                                <img src="{{ asset($product->img ?? 'images/product/default-product.png') }}" class="detail-img">
                                <h4>{{ $product->name }}</h4>
                                <p>{{ $product->unit }} - {{ number_format($product->price) }}</p>
                            </div>
                        @endforeach
                    </div>
                    <div class="booking-pagination" id="pagination-menu">
                        <button class="page-btn prev-btn"><i class="fas fa-chevron-left"></i></button>
                        <span class="page-info"></span>
                        <button class="page-btn next-btn"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>

                <div class="tab-content booking" id="tab-booking">
                    <!-- ĐẶT TRƯỚC (để trống cũng được) -->
                </div>
            </div>

            <!-- RIGHT PANEL -->
            <div class="right-panel">
                <div class="order-header">
                    <div class="order-no" id="orderNo">#1</div>
                    
                    <div class="header-menu">
                        <button class="menu-btn" id="menuBtn">☰</button>
                        <div class="dropdown-content" id="dropdownMenu">
                            <a href="{{ url('/pos/booking') }}"> <i class="fas fa-calendar-check"></i> Lễ Tân</a>
                            <a href="{{ url('/pos/kiot') }}"> <i class="fas fa-store"></i> Quản lý</a>
                            <hr>
                            <form id="logout-form" action="{{ route('pos.logout') }}" method="POST" style="display:none;">
                                @csrf
                            </form>
                            <a href="#" id="logoutLink" class="logout-item">
                                <i class="fas fa-sign-out-alt"></i> Đăng xuất
                            </a>
                        </div>
                    </div>
                </div>

                <div class="table-info">
                    <button id="selectedTableBtn" class="table-btn" disabled>
                        Chưa chọn bàn
                    </button>
                </div>

                <div class="order-list" id="orderList" >
                    <p class="empty">Chưa có món trong đơn
                        <br>Vui lòng chọn món trong thực đơn bên trái màn hình</p>
                </div>

                <div class="order-summary">
                    <div>Nhân viên: {{ auth()->user()->name ?? 'NV' }}</div>
                    <div class="total">Tổng tiền: <span id="totalPrice">0</span></div>
                </div>

                <div class="order-actions">
                    <button class="btn notify" id="notifyBtn"><i class="fa-regular fa-bell"></i> Thông báo</button>
                    <button class="btn temp"><i class="fa-regular fa-file-lines"></i> In tạm tính</button>
                    <button class="btn pay" id="openPay"><i class="fa-solid fa-circle-dollar-to-slot"></i> Thanh toán</button>
                </div>
            </div>
        </div>

        <!-- PAY OVERLAY -->
        <div id="payOverlay" class="pay-overlay"></div>
        <!-- PAY DRAWER -->
        <div id="payDrawer" class="pay-drawer">
            <!-- HEADER -->
            <div class="pay-header">
                <div class="info-inv">
                    <h3 id="payTableInfo"></h3>
                    <span id="payTime"></span>
                </div>
                <button class="close-pay" id="closePay">✕</button>
            </div>

            <div class="pay-body">
                <!-- LEFT: ORDER LIST -->
                <div class="pay-left" id="payOrderList">
                    <div class="pay-group">
                        <div class="group-title"></div>
                        <div class="pay-item">
                            <div class="name">
                                <strong></strong>
                                <small></small>
                            </div>
                            <div class="qty"></div>
                            <div class="price"></div>
                            <div class="total"></div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: PAYMENT INFO -->
                <div class="pay-right">
                    <div class="pay-summary">
                        <div class="row">
                            <span>Tổng tiền hàng</span>
                            <strong id="sumPrice"></strong>
                        </div>
                        <div class="row discount">
                            <span>Giảm giá</span>
                            <button id="discountBtn" class="btn-discount">0</button>
                            <input type="hidden" id="discountInput" value="0">
                        </div>
                        <div class="row promotion">
                            <span>Khuyến mãi</span>
                            <button id="promotionBtn" class="btn-promotion">Chọn KM</button>
                            <input type="hidden" id="promotionId" value="">
                        </div>
                        <div class="row total">
                            <span>Khách cần trả</span>
                            <strong id="needPay"></strong>
                        </div>
                    </div>

                    <!-- PAYMENT METHOD -->
                    <div class="pay-method">
                        <label>
                            <input type="radio" name="pay_method" value="cash" checked>
                            <span>Tiền mặt</span>
                        </label>
                        <label>
                            <input type="radio" name="pay_method" value="transfer">
                            <span>Chuyển khoản</span>
                        </label>
                        <label>
                            <input type="radio" name="pay_method" value="card">
                            <span>Thẻ</span>
                        </label>
                    </div>
                    <button class="btn-confirm-pay">Thanh toán</button>
                </div>
            </div>
        </div>
        <!-- POPUP REDUCE -->
        <div id="discountPopup" class="discount-popup">
            <div class="popup-content">
                <h4>Nhập giảm giá</h4>
                <div class="discount-type">
                    <button data-type="vnd" class="active">VND</button>
                    <button data-type="percent">%</button>
                </div>
                <input type="number" id="discountValue" placeholder="Nhập số">
                <div class="discount-actions">
                    <button id="discountCancel">Bỏ qua</button>
                    <button id="discountSave">Lưu lại</button>
                </div>
            </div>
        </div>

        <div id="promotionPopup" class="discount-popup">
            <div class="popup-content">
                <h4>Chọn khuyến mãi</h4>

                <div id="promotionList" class="promotion-list">
                    <!-- render bằng JS -->
                </div>

                <div class="discount-actions">
                    <button id="promotionCancel">Bỏ qua</button>
                </div>
            </div>
        </div>

        <div id="transferTableModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Đổi bàn</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <p>Chuyển toàn bộ món từ <strong id="currentTableName">...</strong> sang bàn:</p>
                    <select id="targetTableSelect" class="form-control">
                        <option value="">-- Chọn bàn muốn chuyển đến --</option>
                        @foreach($areas as $area)
                            <optgroup label="{{ $area->name }}">
                                @foreach($area->tables as $table)
                                    <option value="{{ $table->id }}" data-name="{{ $table->name }}" data-area="{{ $area->name }}">
                                        {{ $table->name }}
                                    </option>
                                @endforeach
                            </optgroup>
                        @endforeach
                    </select>
                    <p class="warning-text"><i class="fas fa-info-circle"></i> Hành động này sẽ gộp đơn nếu bàn mới đã có món.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" id="cancelTransfer">Hủy</button>
                    <button class="btn-update" id="confirmTransfer">Cập nhật</button>
                </div>
            </div>
        </div>
        <script>
            const BASE_URL = "{{ url('/') }}";
        </script>
        <script src="{{ asset('js/pos/common/toast.js') }}"></script>
        <script src="{{ asset('js/pos/cashier.js') }}"></script>
        <script>
            // Laravel sẽ tự động tạo đường dẫn chính xác dựa vào cấu hình của bạn
            const APP_URL = "{{ url('/') }}";
        </script>
        <div id="toast-container"></div>
    </body>
</html>
