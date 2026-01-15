<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\CategoryIngredient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IngredientController extends Controller
{
    public function index(Request $request)
    {
        $ingredients = Ingredient::with('category')
            ->orderBy('id', 'DESC')
            ->get();

        $categories = CategoryIngredient::orderBy('name')->get();

        return view('pos.ingredient', compact('ingredients', 'categories'));
    }


    public function show($id)
    {
        $ingredient = Ingredient::find($id);

        return response()->json([
            'status' => true,
            'data' => $ingredient
        ]);
    }

    public function store(Request $request)
    {
        // Validate
        $request->validate([
            'name'        => 'required',
            'category_id' => 'required',
            'price'       => 'required|numeric',
            'unit'        => 'nullable|string|max:50'
        ]);


        $ingredient = Ingredient::create([
            'name'        => $request->name,
            'category_id' => $request->category_id,
            'price'       => $request->price,
            'unit'        => $request->unit,
            'quantity'    => 0
        ]);

        return response()->json([
            'status' => true,
            'data' => $ingredient
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name'        => 'required',
            'category_id' => 'required',
            'price'       => 'required|numeric',
            'unit'        => 'nullable|string|max:50'
        ]);

        Ingredient::where('id', $id)->update([
            'name'        => $request->name,
            'category_id' => $request->category_id,
            'price'       => $request->price,
            'unit'        => $request->unit,
        ]);

        return response()->json(['status' => true]);
    }

    public function destroy($id)
    {
        Ingredient::where('id', $id)->delete();

        return response()->json(['status' => true]);
    }

    public function search(Request $request)
    {
        $keyword = $request->keyword;

        $ingredients = Ingredient::where('name', 'like', "%$keyword%")
            ->orWhere('code', 'like', "%$keyword%")
            ->select([
                'id',
                'code',
                'name',
                'unit',
                'quantity as stock_qty',
                'price as last_price',
            ])
            ->limit(10)
            ->get();

        return response()->json($ingredients);
    }
}
