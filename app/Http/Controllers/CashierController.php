<?php

namespace App\Http\Controllers;
use App\Models\Area;
use App\Models\Table;
use App\Models\Product;
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
