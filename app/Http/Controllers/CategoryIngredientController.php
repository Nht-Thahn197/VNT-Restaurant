<?php

namespace App\Http\Controllers;

use App\Models\CategoryIngredient;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CategoryIngredientController extends Controller
{
    public function store(Request $request)
    {
        // Validate đơn giản
        $request->validate([
            'name' => 'required|string|max:150',
        ]);

        // Tạo mới
        $category = CategoryIngredient::create([
            'name' => $request->name
        ]);

        return response()->json([
            'success' => true,
            'category' => $category
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:150'
        ]);

        $category = CategoryIngredient::find($id);

        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        $category->name = $request->name;
        $category->save();

        return response()->json(['success' => true, 'message' => 'Cập nhật thành công']);
    }

    public function destroy($id)
    {
        $category = CategoryIngredient::find($id);

        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        $category->delete();

        return response()->json(['success' => true, 'message' => 'Xóa thành công']);
    }
}
