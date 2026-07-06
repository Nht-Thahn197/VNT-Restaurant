<?php

namespace App\Http\Controllers;
use App\Models\Area;
use App\Models\Table;
use App\Models\Product;
use App\Models\Invoice;
use App\Models\CategoryProduct;
use App\Models\Booking;
use App\Models\BankTransaction;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CashierController extends Controller
{
    public function index(Request $request)
    {
        $areas = Area::all();
        $categories = CategoryProduct::all();
        $tables = Table::with('area')->get();
        $products = Product::leftJoin('product_available as pa', 'pa.product_id', '=', 'product.id')
            ->select('product.*', 'pa.available_qty')
            ->get();

        $staff = auth('staff')->user();
        $locationId = null;
        if ($staff && !empty($staff->location_code)) {
            $locationId = DB::table('location')
                ->where('code', $staff->location_code)
                ->value('id');
        }

        $bookingQuery = Booking::with('table')
            ->whereIn('status', ['waiting', 'assigned'])
            ->where('booking_time', '>=', now())
            ->orderBy('booking_time');

        if ($locationId) {
            $bookingQuery->where('location_id', $locationId);
        }

        $bookings = $bookingQuery->get();
        $bookingGroups = $bookings->groupBy(function ($booking) {
            return Carbon::parse($booking->booking_time)->toDateString();
        });

        return view('pos.cashier', compact(
            'areas', 'categories', 'tables', 'products', 'bookingGroups'
        ));
    }

    public function startServing(Request $request)
    {
        try {
            $tableId = (int) $request->table_id;
            if (!$tableId) {
                return response()->json(['ok' => false, 'error' => 'Thiếu Table ID'], 400);
            }

            $exists = Invoice::where('table_id', $tableId)
                ->where('status', 'serving')
                ->exists();

            if (!$exists) {
                $invoice = Invoice::create([
                    'table_id'   => $tableId,
                    'user_id'    => auth('staff')->id(),
                    'status'     => 'serving',
                    'time_start' => now(),
                    'total'      => 0,
                    'discount'   => 0,
                    'pay_amount' => 0,
                ]);
                return response()->json(['ok' => true, 'message' => 'Created', 'data' => $invoice]);
            }
            return response()->json(['ok' => true, 'message' => 'Already exists']);
        } catch (\Exception $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function removeServing(Request $request)
    {
        Invoice::where('table_id', $request->table_id)
            ->where('status', 'serving')
            ->delete();
        return response()->json(['ok' => true]);
    }

    public function searchProduct(Request $request)
    {
        $keyword = trim($request->q);

        if (!$keyword) {
            return response()->json([]);
        }

        $products = Product::leftJoin('product_available as pa', 'pa.product_id', '=', 'product.id')
            ->where('product.name', 'like', "%{$keyword}%")
            ->limit(10)
            ->get([
                'product.id',
                'product.code',
                'product.name',
                'product.price',
                'product.unit',
                'pa.available_qty'
            ]);
        return response()->json($products);
    }

    public function checkPayment(Request $request)
    {
        $tableId = $request->query('table_id');
        $amount = (float) $request->query('amount');

        if (!$tableId || !$amount) {
            return response()->json(['success' => false, 'message' => 'Missing parameter'], 400);
        }

        $table = Table::find($tableId);
        if (!$table) {
            return response()->json(['success' => false, 'message' => 'Table not found'], 404);
        }

        $tableName = $table->name;
        $tableNameNoSign = $this->removeVietnameseSign($tableName);

        // Tìm giao dịch khớp tiền và nội dung (ToiBenQuan-Bàn 1 hoặc ToiBenQuan-Ban 1, v.v...)
        $transaction = BankTransaction::where('status', 'pending')
            ->where('amount', $amount)
            ->where(function ($query) use ($tableName, $tableNameNoSign) {
                $query->where('description', 'like', "%ToiBenQuan-{$tableName}%")
                      ->orWhere('description', 'like', "%ToiBenQuan-{$tableNameNoSign}%")
                      ->orWhere('description', 'like', "%ToiBenQuan " . $tableName . "%")
                      ->orWhere('description', 'like', "%ToiBenQuan " . $tableNameNoSign . "%")
                      ->orWhere(function ($q) use ($tableName, $tableNameNoSign) {
                          $q->where('description', 'like', '%ToiBenQuan%')
                            ->where(function ($q2) use ($tableName, $tableNameNoSign) {
                                $q2->where('description', 'like', "%{$tableName}%")
                                   ->orWhere('description', 'like', "%{$tableNameNoSign}%");
                            });
                      });
            })
            ->orderBy('created_at', 'desc')
            ->first();

        if ($transaction) {
            // Đánh dấu giao dịch đã được xử lý để tránh trùng khớp lần sau
            $transaction->update(['status' => 'processed']);

            return response()->json([
                'success' => true,
                'transaction' => $transaction
            ]);
        }

        return response()->json(['success' => false]);
    }

    public function simulatePayment(Request $request)
    {
        $tableId = $request->input('table_id');
        $amount = (float) $request->input('amount');

        if (!$tableId || !$amount) {
            return response()->json(['success' => false, 'message' => 'Missing parameter'], 400);
        }

        $table = Table::find($tableId);
        if (!$table) {
            return response()->json(['success' => false, 'message' => 'Table not found'], 404);
        }

        $description = "ToiBenQuan-" . $table->name;

        $transaction = BankTransaction::create([
            'gateway_transaction_id' => 'SIMULATED_' . time() . '_' . rand(1000, 9999),
            'amount' => $amount,
            'description' => $description,
            'reference_code' => 'REF' . time(),
            'account_number' => '8410113801888',
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Simulated transaction created successfully',
            'data' => $transaction
        ]);
    }

    public function updateProductPrice(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:product,id',
            'new_price' => 'required|numeric|min:0',
        ]);

        $result = DB::transaction(function () use ($validated) {
            $newPrice = (float) $validated['new_price'];
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);
            $product->price = $newPrice;
            $product->save();

            $servingInvoiceIds = DB::table('invoice_detail as d')
                ->join('invoice as i', 'i.id', '=', 'd.invoice_id')
                ->where('d.product_id', $product->id)
                ->whereIn('i.status', ['serving', 'pending_payment'])
                ->pluck('i.id')
                ->unique()
                ->values();

            $updatedServingDetails = 0;
            if ($servingInvoiceIds->isNotEmpty()) {
                $updatedServingDetails = DB::table('invoice_detail')
                    ->whereIn('invoice_id', $servingInvoiceIds)
                    ->where('product_id', $product->id)
                    ->update(['price' => $newPrice]);

                foreach ($servingInvoiceIds as $invoiceId) {
                    $total = (float) DB::table('invoice_detail')
                        ->where('invoice_id', $invoiceId)
                        ->selectRaw('COALESCE(SUM(quantity * price), 0) as total')
                        ->value('total');

                    $invoice = Invoice::where('id', $invoiceId)
                        ->whereIn('status', ['serving', 'pending_payment'])
                        ->first();

                    if ($invoice) {
                        $discount = (float) ($invoice->discount ?? 0);
                        $invoice->total = $total;
                        $invoice->pay_amount = max($total - $discount, 0);
                        $invoice->save();
                    }
                }
            }

            return [
                'new_price' => $newPrice,
                'updated_serving_details' => $updatedServingDetails,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật giá bán thành công.',
            'new_price' => $result['new_price'],
            'updated_serving_details' => $result['updated_serving_details'],
        ]);
    }

    private function removeVietnameseSign($str)
    {
        $str = preg_replace("/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/", "a", $str);
        $str = preg_replace("/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/", "e", $str);
        $str = preg_replace("/(ì|í|ị|ỉ|ĩ)/", "i", $str);
        $str = preg_replace("/(ò|ó|ọ|ỏ|ã|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/", "o", $str);
        $str = preg_replace("/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/", "u", $str);
        $str = preg_replace("/(ỳ|ý|ỵ|ỷ|ỹ)/", "y", $str);
        $str = preg_replace("/(đ)/", "d", $str);
        $str = preg_replace("/(À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ)/", "A", $str);
        $str = preg_replace("/(È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ)/", "E", $str);
        $str = preg_replace("/(Ì|Í|Ị|Ỉ|Ĩ)/", "I", $str);
        $str = preg_replace("/(Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ)/", "O", $str);
        $str = preg_replace("/(Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ)/", "U", $str);
        $str = preg_replace("/(Ỳ|Ý|Ỵ|Ỷ|Ỹ)/", "Y", $str);
        $str = preg_replace("/(Đ)/", "D", $str);
        return $str;
    }
}
