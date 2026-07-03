<?php

// Tải Laravel framework
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$vnp_HashSecret = config('vnpay.hash_secret');
$inputData = [
    "vnp_Version" => "2.1.0",
    "vnp_TmnCode" => config('vnpay.tmn_code'),
    "vnp_Amount" => 43000000,
    "vnp_Command" => "pay",
    "vnp_CreateDate" => date('YmdHis'),
    "vnp_CurrCode" => "VND",
    "vnp_IpAddr" => "127.0.0.1",
    "vnp_Locale" => "vn",
    "vnp_OrderInfo" => "Thanh toan hoa don POS 114",
    "vnp_OrderType" => "other",
    "vnp_ReturnUrl" => "http://localhost/pos/vnpay/return",
    "vnp_TxnRef" => "114_" . time(),
];
ksort($inputData);
$hashdata = "";
$i = 0;
foreach ($inputData as $key => $value) {
    if ($i == 1) {
        $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
    } else {
        $hashdata .= urlencode($key) . "=" . urlencode($value);
        $i = 1;
    }
}
$vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
$inputData['vnp_SecureHash'] = $vnpSecureHash;
$vnp_Url = config('vnpay.url') . "?" . http_build_query($inputData, '', '&', PHP_QUERY_RFC1738);

echo $vnp_Url;
