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
            <form method="POST" action="{{ route('pos.login.post') }}">
                @csrf 
                <!-- Mã quán --> 
                <div class="form-group"> 
                    <input type="text" name="location_code" placeholder="Mã quán" required> 
                </div> 
                <!-- SĐT đăng nhập --> 
                <div class="form-group"> 
                    <input type="text" name="phone" placeholder="Số điện thoại nhân viên" required> 
                </div> 
                <!-- Mật khẩu --> 
                <div class="form-group"> 
                    <input type="password" name="password" placeholder="Mật khẩu" required> 
                </div> 
                <div class="forgot"> <a href="#">Quên mật khẩu?</a> </div> 
                <div class="btn-box"> 
                    <button type="submit" name="action" value="manage" class="btn btn-manage"><i class="fas fa-analytics"></i> Quản lý</button> 
                    <button type="submit" name="action" value="cashier" class="btn btn-sale"><i class="fas fa-shopping-cart"></i> Bán hàng</button> 
                </div> 
            </form>
        </div>
        <div class="bottom-contact">
            ☎ Hỗ trợ 1900 6522 • 🌐 Tiếng Việt (VN)
        </div>
    </body>
</html>
