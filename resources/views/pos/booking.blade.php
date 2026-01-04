<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="base-url" content="{{ url('/') }}">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
        <link rel="shortcut icon" href="{{ asset('favicon-pos.ico') }}">
        <link rel="stylesheet" href="{{ asset('css/pos/booking.css') }}">
        <title>Tới Bến Quán - Đặt bàn</title>
    </head>
    <body>

        <div class="booking-page">

            <!-- ===== HEADER ===== -->
            <header class="page-header">
                <h2>Đặt bàn</h2>

                <div class="header-menu">
                    <button class="menu-btn" id="menuBtn"><i class="fas fa-bars"></i></button>
                    <div class="dropdown-content" id="dropdownMenu">
                        <a href="{{ url('/pos/cashier') }}">
                            <i class="fas fa-cash-register"></i> Thu ngân
                        </a>
                        <a href="{{ url('/pos/kiot') }}">
                            <i class="fas fa-store"></i> Quản lý
                        </a>
                        <hr>
                        <form id="logout-form" action="{{ route('pos.logout') }}" method="POST" style="display:none;">
                            @csrf
                        </form>
                        <a href="#" id="logoutLink" class="logout-item">
                            <i class="fas fa-sign-out-alt"></i> Đăng xuất
                        </a>
                    </div>
                </div>
            </header>

            <div class="layout">

                <!-- ===== SIDEBAR LEFT ===== -->
                <div class="sidebar">

                    <!-- SEARCH -->
                    <div class="filter-box">
                        <div class="box-title">Tìm kiếm</div>
                        <input type="text" class="input-text" placeholder="Theo mã đặt bàn">
                        <input type="text" class="input-text" placeholder="Theo tên khách">
                        <input type="text" class="input-text" placeholder="Theo số điện thoại">
                    </div>

                    <!-- ⏰ THỜI GIAN -->
                    <div class="box">
                        <div class="box-title">Thời gian</div>

                        <!-- BUTTON -->
                        <div class="time-dropdown">
                            <button type="button" class="input-select" id="timeBtn">
                                Toàn thời gian
                                <i class="fa fa-chevron-down"></i>
                            </button>

                            <!-- DROPDOWN -->
                            <div class="time-menu" id="timeMenu">
                                <!-- CỘT NGÀY -->
                                <div class="time-col">
                                    <div class="time-col-title">Theo ngày</div>
                                    <div class="time-item" data-preset="today">Hôm nay</div>
                                    <div class="time-item" data-preset="yesterday">Hôm qua</div>
                                </div>

                                <!-- CỘT TUẦN -->
                                <div class="time-col">
                                    <div class="time-col-title">Theo tuần</div>
                                    <div class="time-item" data-preset="this_week">Tuần này</div>
                                    <div class="time-item" data-preset="last_week">Tuần trước</div>
                                    <div class="time-item" data-preset="last_7_days">7 ngày trước</div>
                                </div>

                                <!-- CỘT THÁNG -->
                                <div class="time-col">
                                    <div class="time-col-title">Theo tháng</div>
                                    <div class="time-item" data-preset="this_month">Tháng này</div>
                                    <div class="time-item" data-preset="last_month">Tháng trước</div>
                                    <div class="time-item" data-preset="last_30_days">30 ngày qua</div>
                                </div>

                                <!-- CỘT NĂM -->
                                <div class="time-col">
                                    <div class="time-col-title">Theo năm</div>
                                    <div class="time-item" data-preset="this_year">Năm nay</div>
                                    <div class="time-item" data-preset="last_year">Năm trước</div>
                                    <div class="time-item" data-preset="all">Toàn thời gian</div>
                                </div>
                            </div>
                        </div>

                        <!-- CUSTOM DATE -->
                        <div class="time-custom">
                            <input
                                type="text"
                                id="dateRange"
                                class="input-text"
                                placeholder="Lựa chọn khác"
                                readonly
                            >
                            <input type="hidden" id="fromDate">
                            <input type="hidden" id="toDate">
                        </div>
                    </div>

                    <!-- ROOM -->
                    <div class="filter-box">
                        <div class="box-title">Phòng/Bàn</div>
                        <div class="table-dropdown">
                            <button type="button" class="input-select" id="tableBtn">
                                Tất cả bàn
                                <i class="fa fa-chevron-down"></i>
                            </button>

                            <div class="table-menu" id="tableMenu">
                                <input type="text" id="tableSearch" placeholder="Tìm nhanh bàn..." class="input-text">
                                <div class="table-list-wrapper">
                                    <div class="table-item active" data-id="all">Tất cả bàn</div>
                                    @foreach($tables as $table)
                                        <div class="table-item" data-id="{{ $table->id }}">
                                            {{ $table->name }}
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- ===== MAIN ===== -->
                <main class="main-content">

                    <!-- STATUS + ACTION -->
                    <div class="toolbar">
                        <div class="status-filter">
                            <label class="status-item waiting">
                                <input type="checkbox" class="status-checkbox" value="waiting" checked>
                                <span>Chờ xếp bàn</span>
                            </label>

                            <label class="status-item assigned">
                                <input type="checkbox" class="status-checkbox" value="assigned" checked>
                                <span>Đã xếp bàn</span>
                            </label>

                            <label class="status-item received">
                                <input type="checkbox" class="status-checkbox" value="received" checked>
                                <span>Đã nhận bàn</span>
                            </label>

                            <label class="status-item cancel">
                                <input type="checkbox" class="status-checkbox" value="cancel">
                                <span>Đã hủy</span>
                            </label>
                        </div>

                        <button class="btn-create">
                            <i class="fas fa-calendar-plus"></i> Đặt bàn
                        </button>
                    </div>

                    <!-- TABLE -->
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Mã đặt bàn</th>
                                <th>Giờ đến</th>
                                <th>Khách hàng</th>
                                <th>Điện thoại</th>
                                <th>Số khách</th>
                                <th>Phòng/Bàn</th>
                                <th>Trạng thái</th>
                                <th>Ghi chú</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($bookings as $booking)
                                <tr class="booking-info" data-code="{{ $booking->code }}" data-name="{{ $booking->customer_name }}"
                                    data-phone="{{ $booking->phone }}" data-time="{{ strtotime($booking->booking_time) }}" 
                                    data-table-id="{{ $booking->table_id }}" data-status="{{ $booking->status }}">
                                    <td class="link">{{ $booking->code }}</td>

                                    <td>
                                        {{ \Carbon\Carbon::parse($booking->booking_time)->format('d/m/Y H:i') }}
                                    </td>

                                    <td>{{ $booking->customer_name }}</td>
                                    <td>{{ $booking->phone }}</td>

                                    <td>{{ $booking->guest_count }}</td>

                                    <td>
                                        {{ $booking->table ? $booking->table->name : '' }}
                                    </td>

                                    <td>
                                        <span class="badge {{ $booking->status }}">
                                            @switch($booking->status)
                                                @case('waiting') Chờ xếp bàn @break
                                                @case('assigned') Đã xếp bàn @break
                                                @case('received') Đã nhận bàn @break
                                                @case('cancel') Đã hủy @break
                                            @endswitch
                                        </span>
                                    </td>

                                    <td>{{ $booking->note }}</td>

                                    <td class="action-cell">
                                        @if($booking->status !== 'cancel')
                                            <div class="action-buttons">

                                                {{-- Sửa / Nhận bàn --}}
                                                @if($booking->status !== 'received')
                                                    <i class="fa-regular fa-pen-to-square edit-icon"
                                                    data-id="{{ $booking->id }}"
                                                    data-status="{{ $booking->status }}"></i>
                                                @endif

                                                {{-- Nhận bàn (chỉ khi assigned) --}}
                                                @if($booking->status === 'assigned')
                                                    <i class="fas fa-file-edit receive-icon"
                                                    data-id="{{ $booking->id }}"></i>
                                                @endif

                                                {{-- Hủy (chỉ khi chưa received) --}}
                                                @if($booking->status !== 'received')
                                                    <i class="far fa-trash-alt delete-icon"
                                                    data-id="{{ $booking->id }}"></i>
                                                @endif

                                            </div>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                    <div class="booking-pagination" id="pagination">
                        <button id="prevPage" class="page-btn"><i class="fas fa-chevron-left"></i></button>
                        <span id="pageInfo"></span>
                        <button id="nextPage" class="page-btn"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </main>
            </div>
        </div>

        <!-- ===== BOOKING MODAL ===== -->
        <div class="modal-overlay" id="bookingModal">
            <div class="modal">

                <div class="modal-header">
                    <h3>Thêm mới đặt bàn</h3>
                    <button class="btn-close" id="closeBookingModal">&times;</button>
                </div>

                <div class="modal-body">
                    <form id="bookingForm">

                        <div class="form-grid">

                            <!-- LEFT -->
                            <div>
                                <input type="hidden" name="customer_id" id="customer_id">
                                <label>Tên khách hàng *</label>
                                <input type="text" name="customer_name" id="customer_name" placeholder="Nhập tên khách">

                                <label>Số điện thoại *</label>
                                <input type="text" name="phone" id="phone" placeholder="Nhập số điện thoại">

                                <label>Giờ đến</label>
                                <input type="datetime-local" name="arrival_time">

                                <label>Tiền đặt cọc</label>
                                <input type="number" name="deposit" placeholder="Nhập số tiền">

                                <label>Món đặt trước</label>

                                <div id="preorderSummary" class="preorder-summary">
                                    <em class="text-muted">Chưa có món đặt trước</em>
                                </div>

                                <button type="button" class="link-btn" id="btnAddPreorder">
                                    + Thêm / Sửa món
                                </button>
                            </div>

                            <!-- RIGHT -->
                            <div>
                                <label>Chương trình</label>
                                <input type="text" id="promotion_name" disabled>
                                <input type="hidden" name="promotion_id" id="promotion_id">

                                <label>Số lượng khách</label>
                                <div class="guest-row">
                                    <span>Người lớn</span>
                                    <input type="number" name="adult" value="1" min="1">
                                    <span>Trẻ em</span>
                                    <input type="number" name="child" value="0" min="0">
                                </div>

                                <label>Phòng/Bàn</label>
                                <select name="table_id">
                                    <option value="">Chờ xếp bàn</option>
                                    @foreach ($tables as $table)
                                        <option value="{{ $table->id }}"
                                                data-area-id="{{ $table->area_id }}">
                                            {{ $table->name }}
                                        </option>
                                    @endforeach
                                </select>

                                <label>Ghi chú</label>
                                <textarea name="note" rows="3"></textarea>
                            </div>

                        </div>

                    </form>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-danger" id="cancelBookingBtn"><i class="fas fa-times"></i> Hủy đặt</button>
                    <button class="btn btn-save" id="saveBooking"><i class="fas fa-save"></i> Lưu</button>
                    <button class="btn btn-cancel" id="cancelBooking"><i class="fas fa-ban"></i> Bỏ qua</button>
                </div>
            </div>
        </div>

        <div id="preorderModal" class="modal-overlay">
            <div class="modal-box modal-lg">
                <div class="modal-header">
                    <h3>Thêm món cho bàn đặt</h3>
                    <button type="button" class="btn-close" id="closePreorderModal">&times;</button>
                </div>

                <p class="text-muted">
                    Món đặt trước sẽ được tự động thêm vào đơn khi nhận khách
                </p>
                
                <div class="preorder-search-wrapper">
                    <input
                        type="text"
                        id="searchPreorderProduct"
                        class="input-search"
                        placeholder="Tìm hàng hóa theo mã hoặc tên"
                    >
                    <ul id="preorderSearchResult" class="preorder-search-result"></ul>
                </div>

                <table class="table mt-2">
                    <thead>
                        <tr>
                            <th>Mã hàng</th>
                            <th>Tên hàng</th>
                            <th>Giá bán</th>
                            <th>Số lượng</th>
                            <th>Ghi chú</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="preorderProductList">
                        <!-- render bằng JS -->
                    </tbody>
                </table>

                <div class="modal-footer">
                    <button type="button" class="btn btn-save" id="savePreorder">
                        <i class="fas fa-save"></i> Lưu
                    </button>
                    <button type="button" class="btn btn-cancel" id="cancelPreorder">
                        <i class="fas fa-ban"></i> Bỏ qua
                    </button>
                </div>
            </div>
        </div>
        <script src="{{ asset('js/pos/common/toast.js') }}"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js"></script>
        <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
        <script src="{{ asset('js/pos/booking.js') }}"></script>
        <div id="toast-container"></div>
    </body>
</html>
