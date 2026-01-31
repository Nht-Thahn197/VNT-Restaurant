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
            @if($promotions->count() > 0)
                @php $featured = $promotions->first(); @endphp
                <div class="news-banner">
                    <a href="#">
                        <img class="big-banner" src="{{ asset($featured->images ?? 'images/news/news4.png') }}" alt="{{ $featured->name ?? 'Banner' }}" />
                        <div class="banner-text">
                            <h2>{{ $featured->description ?? $featured->name }}</h2>
                            <div class="banner-cta">
                                <span class="icn">
                                    <img src="{{ asset('images/icon/rightarrow-icon.png') }}" />
                                </span>
                                <span class="txt">XEM NGAY</span>
                            </div>
                        </div>
                    </a>
                </div>

                <div class="news-grid">
                    @foreach($promotions->skip(1) as $promotion)
                        <div class="news-item">
                            <a href="#">
                                <img class="news-img" src="{{ asset($promotion->images ?? 'images/news/news1.png') }}" alt="{{ $promotion->name ?? 'News' }}" />
                                <div class="news-content">
                                    <h3>{{ $promotion->description ?? $promotion->name }}</h3>
                                    <span class="icn">
                                        <img src="{{ asset('images/icon/rightarrow-icon.png') }}" style="width:14px;" />
                                    </span>
                                    <span class="txt">XEM NGAY</span>
                                </div>
                            </a>
                        </div>
                    @endforeach
                </div>
            @else
                <p>Chua co tin tuc.</p>
            @endif
        </div>   
    </main>
    <!-- CONTENT START -->
@endsection

@push('js')
    <script src="{{ asset('js/user/news.js') }}"></script>
@endpush