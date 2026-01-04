<?php

namespace App\Http\Controllers;
use App\Models\Table;
use App\Models\Area;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TableController extends Controller
{
    public function index(Request $request)
    {
        $areas = Area::orderBy('name')->get();
        $tables = Table::with('area')->orderBy('id')->get();
        return view('pos.table', compact('areas', 'tables'));
    }

    public function show($id)
    {
        $tb = Table::find($id);

        return response()->json([
            'status' => true,
            'data'   => $tb
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required',
            'area_id'  => 'required'
        ]);

        $tb = Table::create([
            'name'    => $request->name,
            'area_id' => $request->area_id,
            'status'  => 'active'
        ]);

        return response()->json(['status' => true, 'data' => $tb]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name'     => 'required',
            'area_id'  => 'required'
        ]);

        Table::where('id', $id)->update([
            'name'    => $request->name,
            'area_id' => $request->area_id
        ]);

        return response()->json(['status' => true]);
    }

    public function toggleStatus($id)
    {
        $tb = Table::findOrFail($id);

        $tb->status = $tb->status === 'active' ? 'inactive' : 'active';
        $tb->save();

        return response()->json([
            'status' => $tb->status
        ]);
    }

    public function destroy($id)
    {
        Table::where('id', $id)->delete();
        return response()->json(['status' => true]);
    }
}
