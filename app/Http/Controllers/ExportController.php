<?php

namespace App\Http\Controllers;
use App\Models\Export;
use App\Models\ExportDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExportController extends Controller
{
    public function index()
    {
        $exports = Export::with([
            'staff',
            'details.ingredient'
        ])
        ->orderByDesc('export_time')
        ->get();

        return view('pos.export', compact('exports'));
    }

    public function create()
    {
        return view('pos.exportdetail');
    }

    public function store(Request $request)
    {
        $request->validate([
            'items'       => 'required|array|min:1',
            'export_time' => 'required|date',
            'reason'      => 'nullable|string|max:255'
        ]);

        DB::transaction(function () use ($request) {

            $export = Export::create([
                'staff_id'    => auth('staff')->id(),
                'export_time' => $request->export_time,
                'reason'      => $request->reason ?? 'Xuất kho',
                'status'      => 'completed',
            ]);

            foreach ($request->items as $item) {

                $available = DB::table('ingredient_available_stock')
                    ->where('ingredient_id', $item['ingredient_id'])
                    ->value('available_qty');

                if ($available < $item['quantity']) {
                    throw new \Exception('Nguyên liệu không đủ tồn kho');
                }

                ExportDetail::create([
                    'export_id'     => $export->id,
                    'ingredient_id' => $item['ingredient_id'],
                    'quantity'      => $item['quantity'],
                    'price'         => $item['price'] ?? 0,
                ]);

                DB::statement(
                    "CALL use_stock(?, ?, ?, ?)",
                    [
                        $item['ingredient_id'],
                        $item['quantity'],
                        $item['price'] ?? 0,
                        auth('staff')->id(),
                    ]
                );
            }
        });

        return redirect()
            ->route('pos.export')
            ->with('success', 'Đã xuất kho');
    }

    public function cancel($id)
    {
        DB::transaction(function () use ($id) {

            $export = Export::with('details')->lockForUpdate()->findOrFail($id);

            if ($export->status === 'cancelled') {
                throw new \Exception('Phiếu đã bị hủy');
            }

            // Hoàn kho
            foreach ($export->details as $d) {
                DB::statement(
                    "CALL import_stock(?, ?, ?, ?, ?)",
                    [
                        $d->ingredient_id,
                        $d->quantity,
                        $d->price ?? 0,
                        null,
                        auth('staff')->id(),
                    ]
                );
            }
            $export->update([
                'status' => 'cancelled'
            ]);
        });

        return back()->with('success', 'Đã hủy phiếu xuất và hoàn kho');
    }

}
