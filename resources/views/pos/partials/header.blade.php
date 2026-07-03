<header class="header-top">
    <div class="header-left">
        <a href="{{ url('/pos/kiot') }}" class="logo">
            <img src="{{ asset('images/logo/logo-pos.png') }}" alt="">
        </a>
    </div>

    <div class="header-mid">
        {{--
        <a href="#" class="link">Thanh toán</a>
        <a href="#" class="link">Vay vốn</a>
        <a href="#" class="link">Hỗ trợ</a>
        --}}
    </div>

    <div class="header-right">
        <div class="notify-wrap" id="notifyWrap">
            <button class="icon-notify" id="notifyBtn" title="Thông báo" aria-expanded="false" aria-controls="notifyDropdown">
                <span class="notify-icon">🔔</span>
                <span class="notify-badge is-hidden" id="notifyBadge" aria-hidden="true">0</span>
            </button>
            <div class="notify-dropdown" id="notifyDropdown" aria-hidden="true">
                <div class="notify-header">
                    <div class="notify-title">Hộp thư đến</div>
                    <button type="button" class="notify-mark" id="notifyMarkAll">Đánh dấu đã đọc</button>
                </div>
                <div class="notify-tabs">
                    <button type="button" class="notify-tab active" data-filter="all">Tất cả</button>
                    <button type="button" class="notify-tab" data-filter="booking">Đặt bàn</button>
                    <button type="button" class="notify-tab" data-filter="contact">Liên hệ</button>
                </div>
                <div class="notify-list" id="notifyList">
                    <div class="notify-empty">Chưa có thông báo.</div>
                </div>
            </div>
        </div>
        <div class="setting">
            <button class="icon" id="settingsBtn" title="Cài đặt">Thiết lập <i class="hide-mobile fas fa-cog"></i></button>
            <div class="setting-dropdown" id="settingDropdown">
                @can('view_location')
                    <a href="{{ url('/pos/location') }}">Quản lý chi nhánh</a>
                @endcan
                @can('manage_role')
                    <a href="{{ url('/pos/role') }}">Quản lý quyền truy cập</a>
                @endcan
                @can('manage_shift')
                    <a href="{{ url('/pos/work-shifts') }}">Thiết lập ca làm việc</a>
                @endcan
                @can('view_promotion')
                    <a href="{{ url('/pos/promotion') }}">Quản lý khuyến mãi</a>
                @endcan
                @can('view_news')
                    <a href="{{ url('/pos/news') }}">Quản lý tin tức</a>
                @endcan
            </div>
        </div>
        <div class="user-menu">
            <button class="icon" id="btnAccount" title="Tài khoản">Người Dùng <i class="fas fa-user-circle fa-fw"></i></button>
            <div class="user-dropdown" id="userDropdown">
                <a href="#" id="btnAccountLink">Tài khoản</a>
                    <form id="logout-form" action="{{ route('pos.logout') }}" method="POST" style="display:none;">
                        @csrf
                    </form>
                <a href="#" id="logout">Đăng xuất</a>
            </div>
        </div>
        <div id="overlay"></div>
        <div id="accountForm" class="account-form" style="display: {{ $errors->hasAny(['name', 'phone', 'email', 'current_password', 'new_password', 'new_password_confirmation']) ? 'block' : 'none' }}">
            <div class="modal-account">
                <h3>Thông tin người dùng</h3>
                <button id="btnCloseUpdate" class="close-update">×</button>
            </div>
            <form id="updateAccountForm" action="{{ route('pos.user.update') }}" method="POST">
                @csrf
                <input type="hidden" name="id" value="{{ Auth::guard('staff')->id() }}">
                <div class="form-group">
                    <label>Tên người dùng</label>
                    <input type="text" name="name" value="{{ old('name', Auth::guard('staff')->user()->name) }}">
                    <div class="error-message" data-for="name"></div>
                </div>

                <div class="form-group">
                    <label>Mã quán</label>
                    <input type="text" name="location_code" value="{{ Auth::guard('staff')->user()->location_code }}" readonly>
                </div>

                <div class="form-group">
                    <label>SĐT</label>
                    <input type="text" name="phone" value="{{ old('phone', Auth::guard('staff')->user()->phone) }}">
                    <div class="error-message" data-for="phone"></div>
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="{{ old('email', Auth::guard('staff')->user()->email) }}">
                    <div class="error-message" data-for="email"></div>
                </div>

                <h4>Đổi mật khẩu</h4>
                <div class="form-group">
                    <label>Mật khẩu hiện tại</label>
                    <input type="password" name="current_password">
                    <div class="error-message" data-for="current_password"></div>
                </div>
                <div class="form-group">
                    <label>Mật khẩu mới</label>
                    <input type="password" name="new_password">
                    <div class="error-message" data-for="new_password"></div>
                </div>
                <div class="form-group">
                    <label>Gõ lại mật khẩu mới</label>
                    <input type="password" name="new_password_confirmation">
                    <div class="error-message" data-for="new_password_confirmation"></div>
                </div>

                <div class="btn-box">
                    <button type="submit" class="btn btn-save"><i class="fas fa-save"></i> Lưu</button>
                    <button type="button" class="btn btn-cancel" id="btnCancel"><i class="fas fa-ban"></i> Bỏ qua</button>
                </div>

                <div id="successMessage" style="color:green; margin-top:10px;"></div>
            </form>
        </div>

    </div>
</header>

<nav class="header-nav">
    <ul class="nav-list">
        @can('view_dashboard')
            <li><a href="{{ url('/pos/kiot') }}">Tổng quan</a></li>
        @endcan

        @canany(['view_product', 'view_ingredient'])
            <li class="dropdown">
                <a href="#">Hàng hóa</a>
                <ul class="dropdown-menu">
                    @can('view_product')
                        <li><a href="{{ url('/pos/product') }}">Hàng hóa</a></li>
                    @endcan
                    @can('view_ingredient')
                        <li><a href="{{ url('/pos/ingredient') }}">Nguyên liệu</a></li>
                    @endcan
                    @can('view_ingredient')
                        <li><a href="{{ url('/pos/inventory') }}">Kiểm kho</a></li>
                    @endcan
                </ul>
            </li>
        @endcanany

        @can('view_table')
            <li><a href="{{ url('/pos/table') }}">Phòng/Bàn</a></li>
        @endcan

        @canany(['view_invoice', 'view_import', 'view_export'])
            <li class="dropdown">
                <a href="#">Giao dịch</a>
                <ul class="dropdown-menu">

                    @can('view_invoice')
                        <li><a href="{{ url('/pos/invoice') }}">Hóa đơn</a></li>
                    @endcan

                    @can('view_import')
                        <li><a href="{{ url('/pos/import') }}">Nhập hàng</a></li>
                    @endcan

                    @can('view_export')
                        <li><a href="{{ url('/pos/export') }}">Xuất hủy</a></li>
                    @endcan

                </ul>
            </li>
        @endcanany

        @can('view_customer')
            <li><a href="{{ url('/pos/customer') }}">Khách hàng</a></li>
        @endcan

        @canany(['view_staff','manage_shift'])
            <li class="dropdown">
                <a href="#">Nhân viên</a>
                <ul class="dropdown-menu">
                    @can('view_staff')
                        <li><a href="{{ url('/pos/staff') }}">Danh sách nhân viên</a></li>
                    @endcan
                    @can('manage_shift')
                        <li><a href="{{ url('/pos/work-schedule') }}">Lịch làm việc</a></li>
                    @endcan
                    <li><a href="{{ url('/pos/attendance') }}">Bảng chấm công</a></li>
                    @can('view_staff')
                        <li><a href="{{ url('/pos/payroll') }}">Bảng lương</a></li>
                    @endcan
                </ul>
            </li>
        @else
            <li class="dropdown">
                <a href="#">Nhân viên</a>
                <ul class="dropdown-menu">
                    <li><a href="{{ url('/pos/attendance') }}">Bảng chấm công</a></li>
                </ul>
            </li>
        @endcanany



        @canany(['view_daily_report','view_sales_report','view_product_report','view_staff_report'])
            <li class="dropdown">
                <a href="#">Báo cáo</a>
                <ul class="dropdown-menu">
                    @can('view_daily_report')
                        <li><a href="{{ url('/pos/daily-report') }}">Cuối ngày</a></li>
                    @endcan
                    @can('view_sales_report')
                        <li><a href="{{ url('/pos/sales-report') }}">Bán hàng</a></li>
                    @endcan
                    @can('view_product_report')
                        <li><a href="{{ url('/pos/product-report') }}">Hàng hóa</a></li>
                    @endcan
                    @can('view_staff_report')
                        <li><a href="{{ url('/pos/staff-report') }}">Nhân viên</a></li>
                    @endcan
                </ul>
            </li>
        @endcanany

        @canany(['view_sales_analysis','view_product_analysis'])
            <li class="dropdown">
                <a href="#">Phân tích</a>
                <ul class="dropdown-menu">
                    @can('view_sales_analysis')
                        <li><a href="{{ url('/pos/sales-analysis') }}">Bán hàng</a></li>
                    @endcan
                    @can('view_product_analysis')
                        <li><a href="{{ url('/pos/product-analysis') }}">Hàng hóa</a></li>
                    @endcan
                </ul>
            </li>
        @endcanany

        @can('view_contact')
            <li><a href="{{ url('/pos/contact') }}">Liên hệ</a></li>
        @endcan
    </ul>
    <ul class="nav-right">
        <li><a href="{{ url('/pos/booking') }}"><i class="fas fa-calendar-check" style="margin-right: 6px;"></i>Lễ Tân</a></li>
        <li><a href="{{ url('/pos/cashier') }}"><i class="fas fa-file-edit" style="margin-right: 6px;"></i>Thu Ngân</a></li>
    </ul>
</nav>


