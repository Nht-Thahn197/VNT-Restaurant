<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Invoice;
use App\Models\Table;
use App\Services\InvoiceCheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with(['user', 'table.area', 'details.product'])
            ->orderByDesc('time_start')
            ->get();
        $areas = Area::orderBy('name')->get();
        $tables = Table::orderBy('name')->get();

        return view('pos.invoice', compact(
            'invoices',
            'areas',
            'tables'
        ));
    }

    public function checkout(Request $request, InvoiceCheckoutService $checkoutService)
    {
        $data = $request->validate([
            'table_id' => 'required|integer',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'pay_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,transfer,card',
            'promotion_id' => 'nullable|integer',
        ]);

        try {
            $invoice = $checkoutService->complete($data, Auth::guard('staff')->id());

            $updatedProducts = DB::table('product_available')
                ->select('product_id', 'available_qty')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Thanh toán thành công',
                'invoice_id' => $invoice->id,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function cancel($id)
    {
        DB::beginTransaction();

        try {
            $invoice = Invoice::with('details')->lockForUpdate()->findOrFail($id);

            if ($invoice->status === 'cancel') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hóa đơn này đã bị hủy trước đó',
                ], 400);
            }

            $userId = Auth::guard('staff')->id();

            if ($invoice->status === 'completed' && $invoice->details->isNotEmpty()) {
                $ingredientUsed = [];

                foreach ($invoice->details as $detail) {
                    $recipes = DB::table('recipe')
                        ->where('product_id', $detail->product_id)
                        ->get();

                    foreach ($recipes as $recipe) {
                        $ingredientUsed[$recipe->ingredient_id] = ($ingredientUsed[$recipe->ingredient_id] ?? 0)
                            + ($recipe->quantity * $detail->quantity);
                    }
                }

                if (!empty($ingredientUsed)) {
                    $ingredients = DB::table('ingredient')
                        ->whereIn('id', array_keys($ingredientUsed))
                        ->get()
                        ->keyBy('id');

                    foreach ($ingredientUsed as $ingredientId => $quantity) {
                        $ingredient = $ingredients->get($ingredientId);

                        if (!$ingredient) {
                            throw new \Exception('Không tìm thấy nguyên liệu để hoàn kho');
                        }

                        DB::table('inventory_log')->insert([
                            'ingredient_id' => $ingredientId,
                            'type' => 'import',
                            'quantity' => $quantity,
                            'price' => $ingredient->price ?? 0,
                            'total_price' => $quantity * ($ingredient->price ?? 0),
                            'ref_type' => 'invoice',
                            'ref_id' => $invoice->id,
                            'staff_id' => $userId,
                            'created_at' => now(),
                        ]);

                        DB::table('ingredient')
                            ->where('id', $ingredientId)
                            ->increment('quantity', $quantity);
                    }
                }
            }

            $invoice->update([
                'status' => 'cancel',
                'time_end' => $invoice->time_end ?? now(),
            ]);

            DB::table('activity_log')->insert([
                'staff_id' => $userId,
                'action' => 'cancel_invoice',
                'subject_type' => 'invoice',
                'subject_id' => $invoice->id,
                'amount' => $invoice->pay_amount,
                'description' => 'hủy hóa đơn #' . $invoice->id,
                'created_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy hóa đơn',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
