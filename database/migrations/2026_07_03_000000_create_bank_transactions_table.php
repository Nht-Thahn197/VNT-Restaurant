<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('bank_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('gateway_transaction_id')->nullable()->unique(); // Mã giao dịch của cổng hoặc ngân hàng
            $table->decimal('amount', 15, 2); // Số tiền nhận được
            $table->string('description'); // Nội dung chuyển khoản
            $table->string('reference_code')->nullable(); // Mã tham chiếu ngân hàng
            $table->string('account_number')->nullable(); // Tài khoản nhận
            $table->string('status')->default('pending'); // Trạng thái xử lý (pending, processed)
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('bank_transactions');
    }
};
