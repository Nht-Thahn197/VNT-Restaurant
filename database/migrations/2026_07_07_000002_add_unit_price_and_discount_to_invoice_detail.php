<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('invoice_detail')) {
            return;
        }

        if (!Schema::hasColumn('invoice_detail', 'unit_price')) {
            Schema::table('invoice_detail', function (Blueprint $table) {
                $table->decimal('unit_price', 12, 2)->nullable()->after('price');
            });
        }

        if (!Schema::hasColumn('invoice_detail', 'item_discount')) {
            Schema::table('invoice_detail', function (Blueprint $table) {
                $afterColumn = Schema::hasColumn('invoice_detail', 'unit_price') ? 'unit_price' : 'price';
                $table->decimal('item_discount', 12, 2)->default(0)->after($afterColumn);
            });
        }

        DB::table('invoice_detail')
            ->whereNull('unit_price')
            ->update(['unit_price' => DB::raw('price')]);
    }

    public function down(): void
    {
        if (!Schema::hasTable('invoice_detail')) {
            return;
        }

        if (Schema::hasColumn('invoice_detail', 'item_discount')) {
            Schema::table('invoice_detail', function (Blueprint $table) {
                $table->dropColumn('item_discount');
            });
        }

        if (Schema::hasColumn('invoice_detail', 'unit_price')) {
            Schema::table('invoice_detail', function (Blueprint $table) {
                $table->dropColumn('unit_price');
            });
        }
    }
};
