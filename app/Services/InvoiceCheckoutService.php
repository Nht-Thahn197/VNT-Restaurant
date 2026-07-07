<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceDetail;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InvoiceCheckoutService
{
    public function complete(array $data, ?int $staffId = null): Invoice
    {
        return DB::transaction(function () use ($data, $staffId) {
            $invoice = Invoice::where('table_id', $data['table_id'])
                ->where('status', 'serving')
                ->lockForUpdate()
                ->first();

            if (!$invoice) {
                throw new RuntimeException('Không tìm thấy hóa đơn đang phục vụ cho bàn này');
            }

            $staffId = $staffId ?: $invoice->user_id;

            $normalizedItems = [];
            $grossTotal = 0;
            $itemDiscountTotal = 0;
            $netTotal = 0;

            foreach ($data['items'] as $item) {
                $quantity = max(1, (int) $item['qty']);
                $salePrice = max(0, (float) $item['price']);
                $submittedDiscount = array_key_exists('item_discount', $item)
                    ? max(0, (float) $item['item_discount'])
                    : 0;
                $unitPrice = array_key_exists('unit_price', $item)
                    ? max(0, (float) $item['unit_price'])
                    : $salePrice + $submittedDiscount;

                if ($unitPrice < $salePrice) {
                    $unitPrice = $salePrice;
                }

                $itemDiscount = max($unitPrice - $salePrice, 0);

                $grossTotal += $quantity * $unitPrice;
                $itemDiscountTotal += $quantity * $itemDiscount;
                $netTotal += $quantity * $salePrice;

                $normalizedItems[] = [
                    'product_id' => $item['product_id'],
                    'qty' => $quantity,
                    'price' => $salePrice,
                    'unit_price' => $unitPrice,
                    'item_discount' => $itemDiscount,
                ];
            }

            $submittedTotal = (float) ($data['total'] ?? 0);
            $submittedDiscount = max(0, (float) ($data['discount'] ?? 0));
            $orderDiscount = $submittedTotal >= ($grossTotal - 0.01)
                ? max($submittedDiscount - $itemDiscountTotal, 0)
                : $submittedDiscount;
            $orderDiscount = min($orderDiscount, $netTotal);
            $invoiceDiscount = min($itemDiscountTotal + $orderDiscount, $grossTotal);
            $payAmount = max($grossTotal - $invoiceDiscount, 0);

            $invoice->update([
                'promotion_id' => $data['promotion_id'] ?? null,
                'total' => $grossTotal,
                'discount' => $invoiceDiscount,
                'pay_amount' => $payAmount,
                'payment_method' => $data['payment_method'],
                'status' => 'completed',
                'time_end' => now(),
            ]);

            InvoiceDetail::where('invoice_id', $invoice->id)->delete();

            $ingredientUsed = [];

            foreach ($normalizedItems as $item) {
                InvoiceDetail::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['qty'],
                    'price' => $item['price'],
                    'unit_price' => $item['unit_price'],
                    'item_discount' => $item['item_discount'],
                ]);

                $recipes = DB::table('recipe')
                    ->where('product_id', $item['product_id'])
                    ->get();

                foreach ($recipes as $recipe) {
                    $needQty = $recipe->quantity * $item['qty'];
                    $ingredientUsed[$recipe->ingredient_id] = ($ingredientUsed[$recipe->ingredient_id] ?? 0) + $needQty;
                }
            }

            try {
                foreach ($ingredientUsed as $ingredientId => $qty) {
                    DB::statement('CALL use_stock(?, ?, ?, ?)', [
                        $ingredientId,
                        $qty,
                        $invoice->id,
                        $staffId,
                    ]);
                }
            } catch (QueryException $e) {
                throw new RuntimeException($e->errorInfo[2] ?? 'Lỗi không xác định', 0, $e);
            }

            DB::table('activity_log')->insert([
                'staff_id' => $staffId,
                'action' => 'checkout',
                'subject_type' => 'invoice',
                'subject_id' => $invoice->id,
                'amount' => $invoice->pay_amount,
                'description' => 'vừa bán hóa đơn #' . $invoice->id . ' với giá trị ' . number_format($invoice->pay_amount) . 'đ',
                'created_at' => now(),
            ]);

            return $invoice->refresh();
        });
    }
}
