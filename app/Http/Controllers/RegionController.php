<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Region;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    public function index()
    {
        $regions = Region::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data'    => $regions
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150'
        ]);

        $region = Region::create([
            'name'   => $request->name,
            'status' => 'active'
        ]);

        return response()->json([
            'success' => true,
            'region'  => $region
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:150'
        ]);

        $region = Region::findOrFail($id);
        $region->name = $request->name;
        $region->save();

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $region = Region::findOrFail($id);
        $region->delete();

        return response()->json(['success' => true]);
    }
}
