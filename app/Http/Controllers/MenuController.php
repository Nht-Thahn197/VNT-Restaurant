<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class MenuController extends Controller
{
    public function filter($categoryId)
    {
        if ($categoryId === "all") {

            $categories = DB::table('category_product')->get();

            $result = [];

            foreach ($categories as $cat) {
                $products = DB::table('product')
                    ->where('category_id', $cat->id)
                    ->get();

                $result[] = [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'products' => $products
                ];
            }

            return response()->json([
                'categories' => $result
            ]);
        }

        // ---- LỌC 1 CATEGORY ----
        $category = DB::table('category_product')->where('id', $categoryId)->first();

        $products = DB::table('product')
            ->where('category_id', $categoryId)
            ->get();
            foreach ($products as $p) {
                $p->img = asset($p->img ?? 'images/product/default-product.png');
            }
        return response()->json([
            'title' => $category->name,
            'products' => $products
        ]);
    }
}
