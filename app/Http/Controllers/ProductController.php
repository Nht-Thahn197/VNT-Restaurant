<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\CategoryProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->leftJoin('product_available as pa', 'pa.product_id', '=', 'product.id')
            ->select(
                'product.*',
                'pa.available_qty',
                'pa.cost_per_dish'
            )
            ->orderBy('product.id', 'DESC');
        $products = $query ->get();
        $categories = CategoryProduct::orderBy('name')->get();

        return view('pos.product', compact('products', 'categories'));
    }

    public function show($id)
    {
        $product = DB::table('product')->where('id', $id)->first();
        $recipe = DB::table('recipe')
            ->join('ingredient', 'recipe.ingredient_id', '=', 'ingredient.id')
            ->where('recipe.product_id', $id)
            ->select(
                'ingredient.id',
                'ingredient.code',
                'ingredient.name',
                'ingredient.price',
                'ingredient.unit',
                'recipe.quantity as qty'
            )
            ->get();

        return response()->json([
            'product' => $product,
            'ingredients' => $recipe
        ]);
    }

    public function store(Request $request)
    {
        $imgPath = null;

        if ($request->hasFile('img')) {
            $image = $request->file('img');
            $filename = Str::slug($request->product_name) . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images/product'), $filename);
            $imgPath = 'images/product/' . $filename;
        }
        $id = DB::table('product')->insertGetId([
            'name' => $request->product_name,
            'category_id' => $request->category_id,
            'price' => $request->price,
            'unit' => $request->unit,
            'type_menu' => $request->type_menu_id,
            'img' => $imgPath,
        ]);

        $ingredients = json_decode($request->ingredients, true);

        if ($ingredients && is_array($ingredients)) {
            foreach ($ingredients as $ing) {
                DB::table('recipe')->insert([
                    'product_id' => $id,
                    'ingredient_id' => $ing['id'],
                    'quantity' => $ing['qty']
                ]);
            }
        }

        return response()->json(['status' => true]);
    }

    public function update(Request $request, $id)
    {
        // Lấy thông tin sản phẩm hiện tại
        $product = DB::table('product')->where('id', $id)->first();

        $imgPath = $product->img; // Mặc định giữ ảnh cũ

        // TRƯỜNG HỢP 1: User bấm X để xoá ảnh
        if ($request->delete_image == 1) {

            // Xóa file nếu tồn tại
            if ($product->img && file_exists(public_path($product->img))) {
                unlink(public_path($product->img));
            }

            $imgPath = null; // Set về null trong DB
        }

        // TRƯỜNG HỢP 2: User upload ảnh mới
        if ($request->hasFile('img')) {

            // Xóa ảnh cũ nếu có
            if ($product->img && file_exists(public_path($product->img))) {
                unlink(public_path($product->img));
            }

            $image = $request->file('img');
            $filename = Str::slug($request->product_name) . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('images/product'), $filename);

            $imgPath = 'images/product/' . $filename;
        }

        // Dữ liệu update
        $updateData = [
            'name'        => $request->product_name,
            'category_id' => $request->category_id,
            'price'       => $request->price,
            'unit'        => $request->unit,
            'type_menu'   => $request->type_menu_id,
            'img'         => $imgPath,
        ];

        DB::table('product')->where('id', $id)->update($updateData);

        // Reset recipe
        DB::table('recipe')->where('product_id', $id)->delete();

        $ingredients = json_decode($request->ingredients, true);

        if ($ingredients && is_array($ingredients)) {
            foreach ($ingredients as $ing) {
                DB::table('recipe')->insert([
                    'product_id'   => $id,
                    'ingredient_id' => $ing['id'],
                    'quantity'      => $ing['qty']
                ]);
            }
        }

        return response()->json(['status' => true]);
    }


    public function destroy($id)
    {
        DB::table('recipe')->where('product_id', $id)->delete();
        DB::table('product')->where('id', $id)->delete();

        return response()->json(['status' => true]);
    }

    public function searchForBooking(Request $request)
    {
        $keyword = trim($request->q);

        if (!$keyword) {
            return response()->json([]);
        }

        $products = Product::where('name', 'like', "%{$keyword}%")
            ->limit(10)
            ->get([
                'id',
                'code',
                'name',
                'price',
                'unit'
            ]);

        return response()->json($products);
    }
}
