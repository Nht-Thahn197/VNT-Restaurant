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
        Schema::create('staff', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('code', 10)->unique();
            $table->string('img', 255)->nullable();
            $table->string('name', 100);
            $table->string('phone', 20)->nullable();
            $table->string('cccd', 20)->nullable();
            $table->string('email', 100)->unique();
            $table->string('password', 255);
            $table->date('dob')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->default('other');
            $table->bigInteger('role_id')->unsigned()->nullable();
            $table->date('start_date')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps(); // created_at + updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
