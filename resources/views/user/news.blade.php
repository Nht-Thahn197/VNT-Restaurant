@extends('layout.user')

@section('content')
    @push('css')
        <link rel="stylesheet" href="{{ asset('css/user/news.css') }}">
    @endpush
    <!-- CONTENT START -->
    <main class="menu-page">
        <!-- Banner -->
        <section class="menu-banner">
            <div class="menu-banner-container">
                <div class="menu-banner-text">
                    <h1>Tin Tức</h1>
                    <p>Nơi cập nhật nhanh nhất những sự kiện nóng hổi, chương trình khuyến mại,
                        <br>
                        khách hàng và thông tin thương hiệu.
                    </p>
                </div>
            </div>
        </section>

        <!-- Danh mục -->
        <div class="menu-scroll-wrapper">
            <div class="fade-zone left"></div>
            <div class="menu-scroll" id="menuScroll">
                <a href="#" class="active">Tất cả</a>
                <a href="#">Ưu ĐÃI</a>
                <a href="#">SỰ KIỆN</a>
                <a href="#">VĂN HÓA</a>
            </div>
            <div class="fade-zone right"></div>
        </div>
        <div class="container">
            <!-- Banner lớn đầu trang -->
            <div class="news-banner">
                <a href="#">
                    <img class="big-banner" src="{{ asset('images/news/news4.png') }}" alt="Banner" />
                    <div class="banner-text">
                        <h2>TỰ DO TẶNG ÁO – MƯA GIÓ KHỎI LO</h2>
                        <div class="banner-cta">
                            <span class="icn">
                                <img src="{{ asset('images/icon/rightarrow-icon.png') }}" />
                            </span>
                            <span class="txt">XEM NGAY</span>
                        </div>
                    </div>
                </a>
            </div>
            <!-- Danh sách tin tức -->
            <div class="news-grid">
                <div class="news-item">
                    <a href="#">
                        <img class="news-img" src="{{ asset('images/news/news1.png') }}" alt="News 1" />
                        <div class="news-content">
                            <h3>🎉 "SINH NHẬT ĐỘC NHẤT - SỐNG CHẤT TỰ DO" PHIÊN BẢN 2025</h3>
                            <span class="icn">
                                <img src="{{ asset('images/icon/rightarrow-icon.png') }}" style="width:14px;" /> 
                            </span>
                            <span class="txt">XEM NGAY</span>
                        </div>
                    </a>
                </div>

                <div class="news-item">
                    <a href="#">
                        <img class="news-img" src="{{ asset('images/news/news2.png') }}" alt="News 2" />
                        <div class="news-content">
                            <h3>Lady Day - Tặng ngay 1 tháp Cocktail dành cho phái đẹp - Thứ 3 hàng tuần</h3>
                            <span class="icn">
                                <img src="{{ asset('images/icon/rightarrow-icon.png') }}" style="width:14px;" /> 
                            </span>
                            <span class="txt">XEM NGAY</span>  
                        </div> 
                    </a>
                </div>

                <div class="news-item">
                    <a href="#">
                        <img class="news-img" src="{{ asset('images/news/news3.png') }}" alt="News 3" />
                        <div class="news-content">
                            <h3>Giảm 30% tất cả các món lẩu sau 22h - Áp dụng tại cơ sở 505 Minh Khai</h3>
                            <span class="icn">
                                <img src="{{ asset('images/icon/rightarrow-icon.png') }}" style="width:14px;" /> 
                            </span>
                            <span class="txt">XEM NGAY</span>    
                        </div>
                    </a>
                </div>
            </div>
        </div>   
    </main>
    <!-- CONTENT START -->
@endsection

@push('js')
    <script src="{{ asset('js/user/news.js') }}"></script>
@endpush