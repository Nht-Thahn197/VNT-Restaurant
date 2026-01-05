<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceDetail;
use App\Models\Area;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

use App\Http\Controllers\Controller;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with(['user', 'table.area', 'details.product'])
            ->orderByDesc('time_start')
            ->get();
        $areas  = Area::orderBy('name')->get();
        $tables = Table::orderBy('name')->get();

        return view('pos.invoice', compact(
            'invoices',
            'areas',
            'tables'
        ));
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'table_id'        => 'required|integer',
            'items'           => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.qty'     => 'required|integer|min:1',
            'items.*.price'   => 'required|numeric|min:0',
            'total'           => 'required|numeric|min:0',
            'discount'        => 'required|numeric|min:0',
            'pay_amount'      => 'required|numeric|min:0',
            'payment_method'  => 'required|in:cash,transfer,card',
            'promotion_id'    => 'nullable|integer',
        ]);

        DB::beginTransaction();

        try {
            $userId = Auth::guard('staff')->id();

            $invoice = Invoice::where('table_id', $request->table_id)
                ->where('status', 'serving')
                ->lockForUpdate()
                ->first();
            if (!$invoice) {
                throw new \Exception('Không tìm thấy hóa đơn đang phục vụ cho bàn này');
            }

            $invoice->update([
                'promotion_id' => $request->promotion_id,
                'total'        => $request->total,
                'discount'     => $request->discount,
                'pay_amount'   => $request->pay_amount,
                'payment_method' => $request->payment_method,
                'status'       => 'completed',
                'time_end'     => now(),
            ]);

            InvoiceDetail::where('invoice_id', $invoice->id)->delete();
            
            $ingredientUsed = [];

            foreach ($request->items as $item) {
                InvoiceDetail::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['qty'],
                    'price'      => $item['price'],
                ]);

                $recipes = DB::table('recipe')
                    ->where('product_id', $item['product_id'])
                    ->get();

                foreach ($recipes as $r) {
                    $needQty = $r->quantity * $item['qty'];

                    if (!isset($ingredientUsed[$r->ingredient_id])) {
                        $ingredientUsed[$r->ingredient_id] = 0;
                    }

                    $ingredientUsed[$r->ingredient_id] += $needQty;
                } 
            }

            try {
                foreach ($ingredientUsed as $ingredientId => $qty) {
                    DB::statement("CALL use_stock(?, ?, ?, ?)", [
                        $ingredientId,
                        $qty,
                        $invoice->id,
                        $userId
                    ]);
                }
            } catch (\Illuminate\Database\QueryException $e) {
                $errorInfo = $e->errorInfo;
                $msg = $errorInfo[2] ?? 'Lỗi không xác định';

                return response()->json([
                    'success' => false,
                    'message' => $msg
                ]);
            }

            DB::commit();
            DB::table('activity_log')->insert([
                'staff_id' => $userId,
                'action'   => 'checkout',
                'subject_type' => 'invoice',
                'subject_id'   => $invoice->id,
                'amount'   => $invoice->pay_amount,
                'description' =>
                    ' vừa bán hóa đơn #' . $invoice->id .
                    ' với giá trị ' . number_format($invoice->pay_amount) . 'đ',
                'created_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thanh toán thành công',
                'invoice_id' => $invoice->id
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
