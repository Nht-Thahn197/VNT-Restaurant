@extends('layout.user')

@section('content')
    @push('css')
        <link rel="stylesheet" href="{{ asset('css/user/menu.css') }}">
    @endpush
        <meta name="filter-url" content="{{ url('/menu/filter') }}">
    <!-- CONTENT START -->
    <main class="menu-page">
        <!-- Banner -->
        <section class="menu-banner">
            <div class="menu-banner-container">
                <div class="menu-banner-text">
                    <h1>Thực đơn</h1>
                    <p>Thăng hoa vị giác với 300+ món nhậu đặc sắc, lẩu nướng, hải sản
                        <br>
                        được chuẩn bị từ những đầu bếp chuyên nghiệp hàng đầu.
                    </p>
                </div>
                <div class="menu-banner-search">
                    <input type="text" placeholder="Tìm kiếm món ăn" />
                    <button><i class="fa fa-search"></i></button>
                </div>
            </div>
        </section>

        <!-- Danh mục -->
        <div class="menu-scroll-wrapper">
            <div class="fade-zone left"></div>
            <button class="scroll-btn left" id="scrollLeft"><i class="fa fa-chevron-left"></i></button>
            <div class="menu-scroll" id="menuScroll">
                <a href="#" class="category-item active" data-category="all">Tất cả</a>
                @foreach($categories as $category)
                    <a href="#" class="category-item" data-category="{{ $category->id }}">
                        {{ $category->name }}
                    </a>
                @endforeach
            </div>
            <button class="scroll-btn right" id="scrollRight"><i class="fa fa-chevron-right"></i></button>
            <div class="fade-zone right"></div>
        </div>

        <!-- Danh sách món -->
        <section id="productContent"></section>
    </main>
    <!-- CONTENT START -->

    <div class="cart-summary-trigger" id="openCart">
        <div class="summary-content">
            <span class="summary-qty"><span id="floatingCount">0</span> MÓN <span class="text-qty">TẠM TÍNH</span></span>
            <div class="summary-price-row">
                <i class="fa fa-list-alt summary-icon"></i>
                <span class="summary-total" id="floatingTotal">0</span>
            </div>
        </div>
    </div>

    <div class="cart-modal-overlay" id="cartOverlay">
        <div class="cart-modal" id="captureArea">
            <div class="modal-header">
                <div class="header-left">
                    <i class="fa fa-book-open"></i>
                    <span>Tạm tính</span>
                </div>
                <div class="header-right">
                    <button class="btn-save-img" id="saveImg"><i class="fa fa-download"></i> LƯU VỀ MÁY</button>
                    <button class="btn-close-modal" id="closeCart">&times;</button>
                </div>
            </div>

            <div class="modal-body">
                <div class="summary-row-top">
                    <span class="label">Tổng tiền</span>
                    <span class="total-amount" id="modalTotal">0</span>
                </div>
                <div class="summary-row-sub">
                    <p class="note-text">
                        Đơn giá tạm tính chỉ mang tính chất tham khảo.<br>
                        Liên hệ hotline để Tự Do có thể tư vấn cho bạn chu đáo nhất.
                    </p>
                    <button class="btn-clear-all" id="clearCart">
                        <i class="fa fa-sync"></i> Xoá hết tạm tính
                    </button>
                </div>
                <div class="cart-items-list" id="modalItems"></div>
            </div>

            <div class="modal-footer">
                <button class="btn-submit-order">ĐẶT BÀN VỚI THỰC ĐƠN NÀY</button>
                <p class="hotline-text">Hoặc gọi <span>*1986</span> để đặt bàn</p>
            </div>
        </div>
    </div>
@endsection

@push('js')
    <script src="{{ asset('js/user/menu.js') }}"></script>
@endpush