<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    {{-- CSS --}}
    <link rel="icon" href="{{ asset('favicon-user.ico') }}" type="image/x-icon">
    <link rel="shortcut icon" href="{{ asset('favicon-user.ico') }}" type="image/x-icon">
    <link rel="stylesheet" href="{{ asset('css/user/layout.css') }}">
    <link rel="stylesheet" href="{{ asset('css/user/calendar.css') }}">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Tilt+Warp&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600&family=Tilt+Warp&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Stardos+Stencil:wght@700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    @stack('css')

    <title>Tới Bến Quán</title>
</head>

<body>

    {{-- HEADER --}}
    @include('user.partials.header')

    {{-- NỘI DUNG TỪ TRANG CON --}}
    <main>
        @yield('content')
    </main>

    {{-- FOOTER --}}
    @include('user.partials.footer')

    {{-- JS --}}
    <div class="app-confirm-overlay" id="appConfirmOverlay" aria-hidden="true">
        <div class="app-confirm-dialog" id="appConfirmDialog" role="dialog" aria-modal="true" aria-labelledby="appConfirmTitle" aria-describedby="appConfirmMessage" tabindex="-1">
            <div class="app-confirm-header">
                <h3 id="appConfirmTitle">Xác nhận</h3>
                <button type="button" class="app-confirm-close" id="appConfirmClose" aria-label="Dong">&times;</button>
            </div>
            <div class="app-confirm-body">
                <div class="app-confirm-icon">
                    <i class="fas fa-triangle-exclamation"></i>
                </div>
                <p id="appConfirmMessage"></p>
            </div>
            <div class="app-confirm-actions">
                <button type="button" class="app-confirm-btn secondary" id="appConfirmCancel">Hủy</button>
                <button type="button" class="app-confirm-btn primary" id="appConfirmOk">Đồng ý</button>
            </div>
        </div>
    </div>
    <script>
        window.APP_URL = "{{ url('/') }}";
    </script>
    <script src="{{ asset('js/user/layout.js') }}"></script>
    <script src="{{ asset('js/user/calendar.js') }}"></script>
    @stack('js')
    
</body>
</html>