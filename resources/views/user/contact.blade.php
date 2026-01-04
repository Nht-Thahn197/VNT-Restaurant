@extends('layout.user')

@section('content')
    @push('css')
        <link rel="stylesheet" href="{{ asset('css/user/contact.css') }}">
    @endpush
    @if(session('success'))
        <div id="toast-success" class="toast-notification">
            <div class="toast-content">
                <i class="fa fa-check-circle"></i>
                <span>{{ session('success') }}</span>
            </div>
            <div class="toast-progress"></div>
        </div>
    @endif
    <!-- CONTENT START -->
    <main class="menu-page">
        <!-- Banner -->
        <section class="menu-banner">
            <div class="menu-banner-container">
                <div class="menu-banner-text">
                    <h1>Liên Hệ</h1>
                    <p>Nhằm mang đến những trải nghiệm tuyệt vời nhất, mọi ý kiến,
                        <br>
                        đóng góp của thực khách sẽ được Tự Do phản hồi trực tiếp và sớm nhất.
                    </p>
                </div>
            </div>
        </section>

        <!-- Danh mục -->
        <div class="menu-scroll-wrapper">
            <div class="fade-zone left"></div>
            <div class="menu-scroll" id="menuScroll">
                <a href="#" id="tabComplaint" class="active">PHẢN ÁNH KHIẾU NẠI</a>
                <a href="#" id="tabMedia">HỢP TÁC TRUYỀN THÔNG</a>
            </div>
            <div class="fade-zone right"></div>
        </div>
        <div id="formComplaint" class="contact-form-wrapper active">
            @include('user.form.complaint') 
        </div> 
        <div id="formMedia" class="contact-form-wrapper"> 
            @include('user.form.media') 
        </div>  
    </main>
    <!-- CONTENT START -->
@endsection

@push('js')
    <script src="{{ asset('js/user/contact.js') }}"></script>
@endpush