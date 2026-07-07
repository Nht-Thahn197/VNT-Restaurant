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
        $data = $request->validate([
            'product_name' => 'required|string|max:150',
            'category_id' => 'required|integer|exists:category_product,id',
            'type_menu_id' => 'required|in:Food,Drink,Other',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'img' => 'nullable|image|max:5120',
            'ingredients' => 'nullable|string',
        ]);

        $imgPath = null;

        if ($request->hasFile('img')) {
            $imgPath = $this->storeProductImage($request->file('img'), $data['product_name']);
        }
        $id = DB::table('product')->insertGetId([
            'name' => $data['product_name'],
            'category_id' => $data['category_id'],
            'price' => $data['price'],
            'unit' => $data['unit'],
            'type_menu' => $data['type_menu_id'],
            'img' => $imgPath,
        ]);

        $ingredients = json_decode($request->input('ingredients', '[]'), true);

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
        $data = $request->validate([
            'product_name' => 'required|string|max:150',
            'category_id' => 'required|integer|exists:category_product,id',
            'type_menu_id' => 'required|in:Food,Drink,Other',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'img' => 'nullable|image|max:5120',
            'ingredients' => 'nullable|string',
        ]);

        $product = DB::table('product')->where('id', $id)->first();

        $imgPath = $product->img;

        if ($request->delete_image == 1) {
            if ($product->img && file_exists(public_path($product->img))) {
                unlink(public_path($product->img));
            }

            $imgPath = null;
        }

        if ($request->hasFile('img')) {

            if ($product->img && file_exists(public_path($product->img))) {
                unlink(public_path($product->img));
            }

            $imgPath = $this->storeProductImage($request->file('img'), $data['product_name']);
        }

        $updateData = [
            'name'        => $data['product_name'],
            'category_id' => $data['category_id'],
            'price'       => $data['price'],
            'unit'        => $data['unit'],
            'type_menu'   => $data['type_menu_id'],
            'img'         => $imgPath,
        ];

        DB::table('product')->where('id', $id)->update($updateData);
        DB::table('recipe')->where('product_id', $id)->delete();

        $ingredients = json_decode($request->input('ingredients', '[]'), true);

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

    protected function storeProductImage($image, string $productName): string
    {
        $directory = public_path('images/product');
        $this->ensureProductImageDirectory($directory);

        $baseName = Str::slug($productName);
        if ($baseName === '') {
            $baseName = Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME)) ?: 'product';
        }

        $extension = $image->getClientOriginalExtension();
        $filename = $baseName . '-' . now()->format('YmdHis') . '-' . Str::random(6);
        if ($extension) {
            $filename .= '.' . $extension;
        }

        $image->move($directory, $filename);

        return 'images/product/' . $filename;
    }

    protected function ensureProductImageDirectory(string $directory): void
    {
        if (! is_dir($directory) && ! mkdir($directory, 0775, true) && ! is_dir($directory)) {
            throw new \RuntimeException('Cannot create product image directory: ' . $directory);
        }

        if (! is_writable($directory)) {
            @chmod($directory, 0775);
        }

        if (! is_writable($directory)) {
            throw new \RuntimeException('Cannot write product image directory: ' . $directory);
        }
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
