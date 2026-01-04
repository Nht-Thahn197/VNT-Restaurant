<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->bigIncrements('id'); 
            $table->string('code', 10)->unique(); 
            $table->unsignedBigInteger('table_id'); 
            $table->unsignedBigInteger('user_id'); 
            $table->unsignedBigInteger('promotion_id')->nullable(); 
            $table->decimal('total', 12, 2)->default(0); 
            $table->decimal('discount', 12, 2)->default(0); 
            $table->decimal('pay_amount', 12, 2)->default(0); 
            $table->enum('status', ['serving', 'completed'])->default('serving'); 
            $table->timestamp('time_start')->useCurrent(); 
            $table->timestamp('time_end')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
