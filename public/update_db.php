<?php

// Script cập nhật Database trực tiếp
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "Đang cập nhật cấu trúc bảng invoice...<br>";
    DB::statement("ALTER TABLE invoice MODIFY COLUMN status ENUM('serving', 'completed', 'cancel', 'pending_payment') DEFAULT 'serving'");
    echo "<b>Cập nhật thành công!</b> Trạng thái 'pending_payment' đã được thêm vào cột status của bảng invoice.<br>";
} catch (\Throwable $e) {
    echo "<b style='color:red;'>Cập nhật thất bại:</b> " . $e->getMessage() . "<br>";
}
