<?php

namespace App\Http\Controllers;

use App\Models\Import;
use App\Models\ImportDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImportController extends Controller
{
    public function index()
    {
        $imports = Import::with([
            'staff',
            'details.ingredient'
        ])
        ->orderByDesc('import_time')
        ->get();

        return view('pos.import', compact('imports'));
    }

    public function create()
    {
        return view('pos.importdetail');
    }

    public function store(Request $request)
    {
        $request->validate([
            'items'       => 'required|array|min:1',
            'import_time' => 'required|date',
        ]);

        DB::transaction(function () use ($request) {

            $totalPrice = collect($request->items)->sum(
                fn ($i) => $i['quantity'] * $i['price']
            );

            $import = Import::create([
                'staff_id'    => auth('staff')->id(),
                'import_time' => $request->import_time,
                'status'      => 'completed',
                'total_price' => $totalPrice,
            ]);

            foreach ($request->items as $item) {

                ImportDetail::create([
                    'import_id'     => $import->id,
                    'ingredient_id' => $item['ingredient_id'],
                    'quantity'      => $item['quantity'],
                    'price'         => $item['price'],
                ]);

                DB::statement(
                    "CALL import_stock(?, ?, ?, ?, ?)",
                    [
                        $item['ingredient_id'],
                        $item['quantity'],
                        $item['price'],
                        $import->id,
                        auth('staff')->id(),
                    ]
                );
            }
        });

        return redirect()
            ->route('pos.import')
            ->with('success', 'Đã nhập hàng');
    }

    public function cancel($id)
    {
        DB::transaction(function () use ($id) {

            $import = Import::with('details')->lockForUpdate()->findOrFail($id);
            if ($import->status !== 'completed') {
                abort(400, 'Phiếu nhập đã bị hủy');
            }

            foreach ($import->details as $detail) {
                $currentQty = DB::table('ingredient')
                    ->where('id', $detail->ingredient_id)
                    ->value('quantity');

                if ($currentQty < $detail->quantity) {
                    abort(
                        400,
                        'Không thể hủy: nguyên liệu đã được sử dụng'
                    );
                }

                // 🔻 TRỪ KHO
                DB::statement(
                    "CALL use_stock(?, ?, ?, ?)",
                    [
                        $detail->ingredient_id,
                        $detail->quantity,
                        $detail->price,
                        auth('staff')->id()
                    ]
                );
            }

            $import->update([
                'status' => 'cancelled'
            ]);
        });

        return back()->with('success', 'Đã hủy phiếu nhập và hoàn kho');
    }
}
