<!DOCTYPE html>
<html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <link rel="shortcut icon" href="{{ asset('favicon-pos.ico') }}">
        <link rel="stylesheet" href="{{ asset('css/pos/login.css') }}">
        <title>Đăng nhập POS</title>
    </head>

    <body>
        <div class="overlay"></div>
        <div class="login-box">
            <img src="{{ asset('images/logo/logo-pos.png') }}" class="logo" alt="Logo POS">
            <div class="title">Bar - Cafe, Nhà hàng, Karaoke & Billiards</div>
            <form method="POST" action="{{ route('pos.login.post') }}" id="loginForm">
                @csrf
                <!-- Mã quán -->
                <div class="form-group">
                    <input type="text" name="location_code" value="{{ old('location_code') }}" placeholder="Mã quán" required>
                </div>
                <!-- SĐT đăng nhập -->
                <div class="form-group">
                    <input type="text" name="phone" value="{{ old('phone') }}" placeholder="Số điện thoại nhân viên" required>
                </div>
                <!-- Mật khẩu -->
                <div class="form-group">
                    <input type="password" name="password" placeholder="Mật khẩu" required>
                </div>
                @php
                    $locationError = $errors->first('location_code');
                    $loginError = $errors->first('login');
                    $phoneError = $errors->first('phone');
                    $passwordError = $errors->first('password');
                @endphp
                @if($locationError || $loginError || $phoneError || $passwordError)
                    <div class="login-error" id="loginError">{{ $locationError ?: ($loginError ?: ($phoneError ?: $passwordError)) }}</div>
                @else
                    <div class="login-error" id="loginError" style="display:none;"></div>
                @endif
                <div class="forgot"> <a href="#">Quên mật khẩu?</a> </div>
                <div class="btn-box">
                    <button type="submit" name="action" value="manage" class="btn btn-manage"><i class="fas fa-analytics"></i> Quản lý</button>
                    <button type="submit" name="action" value="cashier" class="btn btn-sale"><i class="fas fa-shopping-cart"></i> Bán hàng</button>
                </div>
            </form>
        </div>
        <div class="bottom-contact">
            Tổng đài hỗ trợ 1900 6522 | Tiếng Việt (VN)
        </div>
        <script src="{{ asset('js/pos/login.js') }}"></script>
    </body>
</html>
