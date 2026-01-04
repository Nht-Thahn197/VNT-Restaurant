<?php

namespace App\Http\Controllers;

use App\Models\PromotionType;
use Illuminate\Http\Request;

class PromotionTypeController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'code'        => 'required|string|max:50',
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string',
        ]);

        $type = PromotionType::create($request->only(['code','name','description']));

        return response()->json([
            'success' => true,
            'message' => 'Thêm loại khuyến mãi thành công',
            'data'    => $type
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'code'        => 'required|string|max:50',
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string',
        ]);

        $type = PromotionType::findOrFail($id);
        $type->update($request->only(['code','name','description']));

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật loại khuyến mãi thành công',
            'data'    => $type
        ]);
    }

    public function destroy($id)
    {
        $type = PromotionType::findOrFail($id);
        $type->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa loại khuyến mãi thành công'
        ]);
    }
}
