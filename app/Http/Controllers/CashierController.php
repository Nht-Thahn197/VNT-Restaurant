<?php

namespace App\Http\Controllers;
use App\Models\Area;
use App\Models\Table;
use App\Models\Product;
use App\Models\Invoice;
use App\Models\CategoryProduct;

use Illuminate\Http\Request;

class CashierController extends Controller
{
    public function index(Request $request)
    {
        $areas = Area::all();
        $categories = CategoryProduct::all();
        $tables = Table::with('area')->get();
        $products = Product::all();

        return view('pos.cashier', compact(
            'areas', 'categories', 'tables', 'products'
        ));
    }

    public function startServing(Request $request)
    {
        try {
            $tableId = (int) $request->table_id;
            // Kiểm tra xem dữ liệu đầu vào có table_id không
            if (!$tableId) {
                return response()->json(['ok' => false, 'error' => 'Thiếu Table ID'], 400);
            }

            $exists = Invoice::where('table_id', $tableId)
                ->where('status', 'serving')
                ->exists();

            if (!$exists) {
                $invoice = Invoice::create([
                    'table_id'   => $tableId,
                    'user_id'    => auth('staff')->id(),
                    'status'     => 'serving',
                    'time_start' => now(),
                    'total'      => 0,
                    'discount'   => 0,
                    'pay_amount' => 0,
                ]);
                return response()->json(['ok' => true, 'message' => 'Created', 'data' => $invoice]);
            }

            return response()->json(['ok' => true, 'message' => 'Already exists']);
        } catch (\Exception $e) {
            // Trả về lỗi chi tiết để debug
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function removeServing(Request $request)
    {
        Invoice::where('table_id', $request->table_id)
            ->where('status', 'serving')
            ->delete();

        return response()->json(['ok' => true]);
    }

    public function searchProduct(Request $request)
    {
        $keyword = trim($request->q);

        if (!$keyword) {
            return response()->json([]);
        }

        $products = Product::where('name', 'like', "%{$keyword}%")
            ->limit(10)
            ->get([
                'id',
                'name',
                'price',
                'unit'
            ]);

        return response()->json($products);
    }
}
