<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\InvoiceDetail;
use App\Models\Table;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VNPAYController extends Controller
{
    public function createPayment(Request $request)
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
            'payment_method'  => 'required|in:card',
            'promotion_id'    => 'nullable|integer',
        ]);

        DB::beginTransaction();

        try {
            $userId = auth('staff')->id();

            // Lấy hóa đơn phục vụ của bàn
            $invoice = Invoice::where('table_id', $request->table_id)
                ->where('status', 'serving')
                ->lockForUpdate()
                ->first();

            if (!$invoice) {
                throw new \Exception('Không tìm thấy hóa đơn đang phục vụ cho bàn này');
            }

            // Lưu tạm thông tin đơn hàng và chuyển trạng thái sang pending_payment
            $invoice->update([
                'promotion_id' => $request->promotion_id,
                'total'        => $request->total,
                'discount'     => $request->discount,
                'pay_amount'   => $request->pay_amount,
                'payment_method' => $request->payment_method,
                'status'       => 'pending_payment',
            ]);

            // Xóa chi tiết cũ và tạo chi tiết hóa đơn tạm thời
            InvoiceDetail::where('invoice_id', $invoice->id)->delete();
            foreach ($request->items as $item) {
                InvoiceDetail::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['qty'],
                    'price'      => $item['price'],
                ]);
            }

            DB::commit();

            // KHỞI TẠO URL VNPAY
            $vnp_Url = config('vnpay.url');
            $vnp_HashSecret = config('vnpay.hash_secret');
            
            $vnp_TxnRef = $invoice->id . '_' . time();
            $vnp_OrderInfo = "Thanh toan hoa don POS " . $invoice->id;
            $vnp_Amount = (int) ($request->pay_amount * 100);
            
            $ipAddr = $request->ip();
            if ($ipAddr === '::1' || $ipAddr === '::ffff:127.0.0.1' || empty($ipAddr)) {
                $ipAddr = '127.0.0.1';
            }

            $inputData = [
                "vnp_Version" => "2.1.0",
                "vnp_TmnCode" => config('vnpay.tmn_code'),
                "vnp_Amount" => $vnp_Amount,
                "vnp_Command" => "pay",
                "vnp_CreateDate" => date('YmdHis'),
                "vnp_CurrCode" => "VND",
                "vnp_IpAddr" => $ipAddr,
                "vnp_Locale" => "vn",
                "vnp_OrderInfo" => $vnp_OrderInfo,
                "vnp_OrderType" => "other",
                "vnp_ReturnUrl" => route('pos.vnpay.return'),
                "vnp_TxnRef" => $vnp_TxnRef,
            ];
            ksort($inputData);
            $hashdata = "";
            $i = 0;
            foreach ($inputData as $key => $value) {
                if ($i == 1) {
                    $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
                } else {
                    $hashdata .= urlencode($key) . "=" . urlencode($value);
                    $i = 1;
                }
            }
            
            if (isset($vnp_HashSecret)) {
                $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
                $inputData['vnp_SecureHash'] = $vnpSecureHash;
            }
            
            $vnp_Url .= "?" . http_build_query($inputData, '', '&', PHP_QUERY_RFC1738);
            
            Log::info('VNPAY HashData: ' . $hashdata);
            Log::info('VNPAY Url: ' . $vnp_Url);
            file_put_contents(base_path('vnpay_debug.log'), "HashData: " . $hashdata . "\nUrl: " . $vnp_Url . "\n\n", FILE_APPEND);

            return response()->json([
                'success' => true,
                'redirect_url' => $vnp_Url
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function vnpayReturn(Request $request)
    {
        Log::info('VNPAY Return Callback:', $request->all());

        $vnp_SecureHash = $request->query('vnp_SecureHash');
        $inputData = array();
        foreach ($request->query() as $key => $value) {
            if (substr($key, 0, 4) == 'vnp_') {
                $inputData[$key] = $value;
            }
        }
        
        unset($inputData['vnp_SecureHash']);
        unset($inputData['vnp_SecureHashType']);
        ksort($inputData);
        $i = 0;
        $hashData = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }
        
        $secureHash = hash_hmac('sha512', $hashData, config('vnpay.hash_secret'));
        
        $vnp_TxnRef = $request->query('vnp_TxnRef');
        $invoiceId = explode('_', $vnp_TxnRef)[0];
        $invoice = Invoice::find($invoiceId);

        if (!$invoice) {
            return redirect()->route('pos.cashier')->with('error', 'Không tìm thấy hóa đơn cần thanh toán.');
        }

        $tableId = $invoice->table_id;

        if ($secureHash === $vnp_SecureHash) {
            $vnp_ResponseCode = $request->query('vnp_ResponseCode');
            
            if ($vnp_ResponseCode == '00') {
                // THANH TOÁN THÀNH CÔNG
                if ($invoice->status === 'pending_payment') {
                    $this->completeInvoice($invoice);
                }
                return redirect()->route('pos.cashier', ['checkout_success' => 1, 'table_id' => $tableId]);
            }
        }

        // THANH TOÁN THẤT BẠI HOẶC BỊ HỦY
        if ($invoice->status === 'pending_payment') {
            $this->rollbackInvoice($invoice);
        }
        return redirect()->route('pos.cashier', ['checkout_error' => 1, 'table_id' => $tableId]);
    }

    public function vnpayIpn(Request $request)
    {
        Log::info('VNPAY IPN Callback:', $request->all());

        $vnp_SecureHash = $request->query('vnp_SecureHash');
        $inputData = array();
        foreach ($request->query() as $key => $value) {
            if (substr($key, 0, 4) == 'vnp_') {
                $inputData[$key] = $value;
            }
        }
        
        unset($inputData['vnp_SecureHash']);
        unset($inputData['vnp_SecureHashType']);
        ksort($inputData);
        $i = 0;
        $hashData = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }
        
        $secureHash = hash_hmac('sha512', $hashData, config('vnpay.hash_secret'));
        
        if ($secureHash === $vnp_SecureHash) {
            $vnp_TxnRef = $request->query('vnp_TxnRef');
            $invoiceId = explode('_', $vnp_TxnRef)[0];
            $invoice = Invoice::find($invoiceId);

            if ($invoice) {
                $vnp_ResponseCode = $request->query('vnp_ResponseCode');
                
                if ($vnp_ResponseCode == '00') {
                    if ($invoice->status === 'pending_payment') {
                        $this->completeInvoice($invoice);
                    }
                } else {
                    if ($invoice->status === 'pending_payment') {
                        $this->rollbackInvoice($invoice);
                    }
                }

                return response()->json(['RspCode' => '00', 'Message' => 'Confirm Success']);
            }
            return response()->json(['RspCode' => '01', 'Message' => 'Order not found']);
        }
        return response()->json(['RspCode' => '97', 'Message' => 'Invalid signature']);
    }

    private function completeInvoice(Invoice $invoice)
    {
        DB::beginTransaction();
        try {
            $invoice->update([
                'status' => 'completed',
                'time_end' => now(),
            ]);

            // Trừ kho nguyên liệu
            $details = InvoiceDetail::where('invoice_id', $invoice->id)->get();
            $ingredientUsed = [];

            foreach ($details as $detail) {
                $recipes = DB::table('recipe')
                    ->where('product_id', $detail->product_id)
                    ->get();

                foreach ($recipes as $r) {
                    $needQty = $r->quantity * $detail->quantity;

                    if (!isset($ingredientUsed[$r->ingredient_id])) {
                        $ingredientUsed[$r->ingredient_id] = 0;
                    }

                    $ingredientUsed[$r->ingredient_id] += $needQty;
                }
            }

            foreach ($ingredientUsed as $ingredientId => $qty) {
                DB::statement("CALL use_stock(?, ?, ?, ?)", [
                    $ingredientId,
                    $qty,
                    $invoice->id,
                    $invoice->user_id
                ]);
            }

            DB::commit();

            // Ghi nhật ký
            DB::table('activity_log')->insert([
                'staff_id' => $invoice->user_id,
                'action'   => 'checkout',
                'subject_type' => 'invoice',
                'subject_id'   => $invoice->id,
                'amount'   => $invoice->pay_amount,
                'description' => ' vừa bán hóa đơn #' . $invoice->id . ' qua thẻ VNPAY với giá trị ' . number_format($invoice->pay_amount) . 'đ',
                'created_at' => now(),
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Lỗi khi complete hóa đơn VNPAY: ' . $e->getMessage());
        }
    }

    private function rollbackInvoice(Invoice $invoice)
    {
        DB::beginTransaction();
        try {
            $invoice->update([
                'status' => 'serving',
                'payment_method' => 'cash', // Reset
            ]);

            // Xóa chi tiết hóa đơn tạm thời
            InvoiceDetail::where('invoice_id', $invoice->id)->delete();
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Lỗi khi rollback hóa đơn VNPAY: ' . $e->getMessage());
        }
    }
}
