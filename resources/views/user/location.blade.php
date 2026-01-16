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
                    <h1>{{ $locations->count() }} Cơ Sở</h1>
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
                <a href="#" class="active" data-region="">Tất cả</a>
                @foreach($regions as $region)
                    <a href="#" data-region="{{ $region->id }}">{{ $region->name }}</a>
                @endforeach
            </div>
            <div class="fade-zone right"></div>
        </div>

        <section class="location-section">
            @if($locations->count() > 0)
                @php $location = $locations->first(); @endphp
                <div class="location-container" data-region="{{ $location->region_id }}">
                    <div class="location-text">
                        <h2>{{ $location->name }}</h2>
                        <p>{{ $location->description ?? 'Chốn ăn chơi lý tưởng' }}</p>

                        <div class="status">
                            <span class="open">{{ $location->status === 'active' ? 'ĐANG MỞ' : 'ĐÓNG CỬA' }}</span>
                            <span class="time">HOẠT ĐỘNG TỪ {{ $location->formatted_time_start }} – {{ $location->formatted_time_end }}</span>
                        </div>

                        <div class="info-location">
                            <div><small>Sức chứa</small><br><strong>{{ $location->capacity ?? '---' }} KHÁCH</strong></div>
                            <div><small>Diện tích</small><br><strong>{{ $location->area ? number_format($location->area, 0, ',', '.') . ' M²' : '---' }}</strong></div>
                            <div><small>Số tầng</small><br><strong>{{ $location->floors ?? '---' }} TẦNG</strong></div>
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
                        <img src="{{ asset($location->thumbnail ?? 'images/location/L12L04.jpg') }}" alt="{{ $location->name }}">
                    </div>
                </div>
            @else
                <p>Không có cơ sở nào.</p>
            @endif
        </section>
    </main>
    <!-- CONTENT START -->
@endsection

@push('js')
    <script>
        window.locations = @json($locations);
        window.regions = @json($regions);
        window.assetUrl = '{{ asset("") }}';
    </script>
    <script src="{{ asset('js/user/location.js') }}"></script>
@endpush