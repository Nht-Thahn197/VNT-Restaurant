<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        // Thay đổi cột status thành ENUM hỗ trợ thêm 'pending_payment'
        DB::statement("ALTER TABLE invoice MODIFY COLUMN status ENUM('serving', 'completed', 'cancel', 'pending_payment') DEFAULT 'serving'");
    }

    public function down() {
        // Rollback về ENUM cũ (chú ý: nếu có bản ghi 'pending_payment' thì MySQL có thể báo lỗi hoặc convert thành trống)
        DB::statement("ALTER TABLE invoice MODIFY COLUMN status ENUM('serving', 'completed', 'cancel') DEFAULT 'serving'");
    }
};
