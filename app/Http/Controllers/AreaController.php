<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function index()
    {
        return Area::orderBy('name')->get();
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150',
        ]);

        $area = Area::create([
            'name' => $request->name
        ]);

        return response()->json([
            'success' => true,
            'area' => $area
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:150'
        ]);

        $area = Area::find($id);

        if (!$area) {
            return response()->json(['error' => 'Area not found'], 404);
        }

        $area->name = $request->name;
        $area->save();

        return response()->json(['success' => true, 'message' => 'Cập nhật thành công']);
    }

    public function destroy($id)
    {
        $area = Area::find($id);

        if (!$area) {
            return response()->json(['error' => 'Area not found'], 404);
        }

        $area->delete();

        return response()->json(['success' => true, 'message' => 'Xóa thành công']);
    }
}
