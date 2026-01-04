@extends('layout.user')

@section('content')
    @push('css')
        <link rel="stylesheet" href="{{ asset('css/user/location.css') }}">
    @endpush
    <!-- CONTENT START -->
    <main class="menu-page">
        <!-- Banner -->
        <section class="menu-banner">
            <div class="menu-banner-container">
                <div class="menu-banner-text">
                    <h1>1 Cơ Sở</h1>
                    <p>Luôn sẵn sàng đáp ứng mọi nhu cầu tổ chức tiệc:
                        <br>
                        sinh nhật, liên hoan, gặp mặt bạn bè, xem bóng đá...
                    </p>
                </div>
            </div>
        </section>

        <!-- Danh mục -->
        <div class="menu-scroll-wrapper">
            <div class="fade-zone left"></div>
            <div class="menu-scroll" id="menuScroll">
                <a href="#" class="active">Tất cả</a>
                <a href="#">Hà Đông</a>
            </div>
            <div class="fade-zone right"></div>
        </div>

        <section class="location-section">
            <div class="location-container">
                <div class="location-text">
                    <h2>L12-L04 Dương Nội</h2>
                    <p>“Chốn ăn chơi” mới của anh em Hà Đông</p>

                    <div class="status">
                        <span class="open">ĐANG MỞ</span>
                        <span class="time">HOẠT ĐỘNG TỪ 09:00 – 24:00</span>
                    </div>

                    <div class="info-location">
                        <div><small>Sức chứa</small><br><strong>400 KHÁCH</strong></div>
                        <div><small>Diện tích</small><br><strong>1000 M2</strong></div>
                        <div><small>Số tầng</small><br><strong>2 TẦNG</strong></div>
                    </div>

                    <div class="actions">
                        <button class="book"><i class="fa fa-book"></i> Đặt bàn ngay</button>
                        <button class="map"><i class="fa fa-map-marker"></i> Xem bản đồ</button>
                        <button class="detail"><i class="fa fa-eye"></i> Xem chi tiết</button>
                    </div>

                    <div class="phone">
                        <i class="fa fa-phone"></i> 0961581328
                    </div>
                </div>

                <div class="location-image">
                    <img src="{{ asset('images/location/L12L04.jpg') }}" alt="Cơ sở Ba Đình">
                </div>
            </div>
        </section>
    </main>
    <!-- CONTENT START -->
@endsection

@push('js')
    <script src="{{ asset('js/user/location.js') }}"></script>
@endpush