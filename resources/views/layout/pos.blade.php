<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="base-url" content="{{ url('') }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- CSS -->
    <link rel="stylesheet" href="{{ asset('css/pos/layout.css') }}">
    <link rel="shortcut icon" href="{{ asset('favicon-pos.ico') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
    <link rel="stylesheet"href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    @stack('css')

    <title>@yield('title', 'VNTPOS - Ốc Năm Tư')</title>
</head>

<body>

    @include('pos.partials.header')

    <main class="pos-main">
        @yield('content')
    </main>


    <div id="statusConfirmOverlay" style="display:none; position:fixed; top:0;left:0;right:0;bottom:0; background: rgba(0,0,0,0.5); z-index:99999; justify-content:center; align-items:center;">
        <div style="background:#fff; padding:20px; border-radius:8px; width:350px; text-align:center;">
            <p id="statusConfirmText" style="margin-bottom:20px; font-size:16px;"></p>
            <button id="statusConfirmYes" style="margin-right:10px; padding:8px 16px; background:#00b63e; color:#fff; border:none; border-radius:6px;">Đồng ý</button>
            <button id="statusConfirmNo" style="padding:8px 16px; background:#ccc; color:#000; border:none; border-radius:6px;">Bỏ qua</button>
        </div>
    </div>    
    <script src="{{ asset('js/pos/layout.js') }}"></script>
    <script src="{{ asset('js/pos/logout.js') }}"></script>
    <script src="{{ asset('js/pos/common/toast.js') }}"></script>
    @stack('js')
    <div id="toast-container"></div>
</body>
</html>