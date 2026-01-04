@extends('layout.user')

@section('content')
    <!-- LOAD START -->
    <div id="preloader">
        <div class="loader-content">
            <div class="loader-text">Tới Bến Quán</div>
            <div class="progress-bar">
                <div class="progress"></div>
            </div>
            <div class="percent">0%</div>
        </div>
    </div>
    <!-- LOAD END -->

    @push('css')
        <link rel="stylesheet" href="{{ asset('css/user/home.css') }}">
    @endpush

    <!-- SLIDER START -->
    <section class="slider">
        <div class="slides">
            <div class="slide active" style="background-image: url('{{ asset('images/banner/banner1.png') }}');"></div>
            <div class="slide" style="background-image: url('{{ asset('images/banner/banner2.png') }}');"></div>
            <div class="slide" style="background-image: url('{{ asset('images/banner/banner3.png') }}');"></div>
        </div>    
            <button class="prev">&#10094;</button>
            <button class="next">&#10095;</button>
    </section>
    <!-- SLIDER END -->

    <!-- SLOGAN -->
    <section class="slogan-section">
        <h2 class="slogan-text">
            NIỀM VUI LÀ LÍ DO <br>
            TỚI BẾN LÀ ĐIỂM ĐẾN
        </h2>   
    </section>
    <!-- SLOGAN -->
    <li><a href="{{ route('menu') }}" class="menu">Xem Thực Đơn</a></li>

    <!-- NEWS START -->
    <section class="news-section">
        <div class="news-container">

            <!-- Tin 1 -->
            <div class="news-card">
                <img src="{{ asset('images/news/news1.png') }}" alt="Sinh nhật độc nhất" class="news-img">
                <div class="news-content">
                    <h3>🎉 "NGÀY CỦA BẠN – QUÁN "TỚI BẾN" CÙNG BẠN" </h3>
                    <p>Sinh nhật không chỉ là một bữa tiệc “nhậu”, mà là ngày chúng ta được chào đón đến với cuộc đời!</p>
                    <button class="news-btn">🍻 NHẬN NGAY</button>
                </div>
            </div>
            <!-- Tin 2 -->
            <div class="news-card">
                <img src="{{ asset('images/news/news2.png') }}" alt="Combo Tới Bến" class="news-img">
                <div class="news-content">
                    <h3>🔥 COMBO RA MẮT – GOM VỊ NGON,GÓI TRỌN NIỀM VUI!</h3>
                    <p>Một combo không chỉ là hương vị, mà là câu chuyện của những buổi tụ tập chẳng muốn kết thúc.</p>
                    <button class="news-btn">🍻 NHẬN NGAY</button>
                </div>
            </div>
            <!-- Tin 3 -->
            <div class="news-card">
                <img src="{{ asset('images/news/news3.png') }}" alt="Bộ đôi trà đậm vị" class="news-img">
                <div class="news-content">
                    <h3>🥂 Uống ngụm trà, chill tới bến!</h3>
                    <p>Để bữa ăn thêm tròn vị, Tới Bến tặng thêm đôi trà cho đủ vui!</p>
                    <button class="news-btn">🍻 NHẬN NGAY</button>
                </div>
            </div>
        </div>
        <div class="news-viewall">
            <a href="{{ route('news') }}">XEM TẤT CẢ</a>
        </div>
    </section>
    <!-- NEWS END -->
@endsection

@push('js')
    <script src="{{ asset('js/user/home.js') }}"></script>
    <script src="{{ asset('js/user/load.js') }}"></script>
@endpush