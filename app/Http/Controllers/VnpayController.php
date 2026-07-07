<?php

namespace App\Http\Controllers;

use App\Services\InvoiceCheckoutService;
use App\Services\VnpayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use RuntimeException;

class VnpayController extends Controller
{
    public function createPayment(Request $request, VnpayService $vnpay)
    {
        $data = $request->validate([
            'table_id' => 'required|integer',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.item_discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'pay_amount' => 'required|numeric|min:1',
            'payment_method' => 'nullable|in:card',
            'promotion_id' => 'nullable|integer',
            'bank_code' => 'nullable|string|max:20',
        ]);

        try {
            $bankCode = $data['bank_code'] ?? null;
            unset($data['bank_code']);

            $data = $this->normalizeCheckoutData($data);
            $txnRef = $this->makeTxnRef((int) $data['table_id']);

            Cache::put($this->cacheKey($txnRef), [
                'status' => 'pending',
                'checkout' => $data,
                'staff_id' => Auth::guard('staff')->id(),
                'amount' => (int) round($data['pay_amount']),
                'created_at' => now()->toIso8601String(),
            ], now()->addHours(3));

            $paymentUrl = $vnpay->createPaymentUrl(
                $txnRef,
                (int) round($data['pay_amount']),
                'Thanh toan hoa don ' . $txnRef,
                $request,
                $bankCode
            );

            return response()->json([
                'success' => true,
                'txn_ref' => $txnRef,
                'redirect_url' => $paymentUrl,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function return(Request $request, VnpayService $vnpay, InvoiceCheckoutService $checkoutService)
    {
        $params = $request->query();
        $txnRef = (string) ($params['vnp_TxnRef'] ?? '');
        $query = [
            'vnpay_status' => 'failed',
            'vnpay_code' => (string) ($params['vnp_ResponseCode'] ?? ''),
            'txn_ref' => $txnRef,
        ];

        try {
            if ($txnRef === '' || !$vnpay->verifySignature($params)) {
                $query['vnpay_status'] = 'invalid_signature';
            } elseif ($this->isSuccessfulVnpayResponse($params)) {
                $result = $this->completePayment($txnRef, $params, $checkoutService);
                $query['vnpay_status'] = 'success';
                $query['invoice_id'] = $result['invoice_id'];
                $query['table_id'] = $result['table_id'];
            } else {
                $this->markPaymentFailed($txnRef, $params);
            }
        } catch (\Throwable $e) {
            $query['vnpay_status'] = 'error';
            $query['message'] = $e->getMessage();
        }

        return redirect()->route('pos.cashier', array_filter($query, static fn ($value) => $value !== null && $value !== ''));
    }

    public function ipn(Request $request, VnpayService $vnpay, InvoiceCheckoutService $checkoutService)
    {
        $params = $request->query();
        $txnRef = (string) ($params['vnp_TxnRef'] ?? '');

        if ($txnRef === '' || !$vnpay->verifySignature($params)) {
            return response()->json(['RspCode' => '97', 'Message' => 'Invalid Checksum']);
        }

        $payment = Cache::get($this->cacheKey($txnRef));
        if (!$payment) {
            return response()->json(['RspCode' => '01', 'Message' => 'Order not Found']);
        }

        if (!$this->amountMatches($payment, $params)) {
            return response()->json(['RspCode' => '04', 'Message' => 'Invalid Amount']);
        }

        if (($payment['status'] ?? null) === 'completed') {
            return response()->json(['RspCode' => '02', 'Message' => 'Order already confirmed']);
        }

        try {
            if ($this->isSuccessfulVnpayResponse($params)) {
                $this->completePayment($txnRef, $params, $checkoutService);
            } else {
                $this->markPaymentFailed($txnRef, $params);
            }

            return response()->json(['RspCode' => '00', 'Message' => 'Confirm Success']);
        } catch (\Throwable $e) {
            return response()->json(['RspCode' => '99', 'Message' => $e->getMessage()]);
        }
    }

    private function normalizeCheckoutData(array $data): array
    {
        $data['payment_method'] = 'card';
        $data['table_id'] = (int) $data['table_id'];
        $data['promotion_id'] = $data['promotion_id'] ?? null;
        $submittedTotal = (float) $data['total'];
        $submittedDiscount = max(0, (float) $data['discount']);

        $data['items'] = array_map(static function (array $item) {
            $price = max(0, (float) $item['price']);
            $submittedDiscount = array_key_exists('item_discount', $item)
                ? max(0, (float) $item['item_discount'])
                : 0;
            $unitPrice = array_key_exists('unit_price', $item)
                ? max(0, (float) $item['unit_price'])
                : $price + $submittedDiscount;

            if ($unitPrice < $price) {
                $unitPrice = $price;
            }

            return [
                'product_id' => (int) $item['product_id'],
                'qty' => (int) $item['qty'],
                'price' => $price,
                'unit_price' => $unitPrice,
                'item_discount' => max($unitPrice - $price, 0),
            ];
        }, $data['items']);

        $grossTotal = 0;
        $itemDiscountTotal = 0;
        $netTotal = 0;

        foreach ($data['items'] as $item) {
            $qty = max(1, (int) $item['qty']);
            $grossTotal += $qty * $item['unit_price'];
            $itemDiscountTotal += $qty * $item['item_discount'];
            $netTotal += $qty * $item['price'];
        }

        $orderDiscount = $submittedTotal >= ($grossTotal - 0.01)
            ? max($submittedDiscount - $itemDiscountTotal, 0)
            : $submittedDiscount;
        $orderDiscount = min($orderDiscount, $netTotal);

        $data['total'] = $grossTotal;
        $data['discount'] = min($itemDiscountTotal + $orderDiscount, $grossTotal);
        $data['pay_amount'] = max($data['total'] - $data['discount'], 0);

        return $data;
    }

    private function completePayment(string $txnRef, array $params, InvoiceCheckoutService $checkoutService): array
    {
        $key = $this->cacheKey($txnRef);
        $payment = Cache::get($key);

        if (!$payment) {
            throw new RuntimeException('Không tìm thấy giao dịch VNPAY');
        }

        if (($payment['status'] ?? null) === 'completed') {
            return [
                'invoice_id' => $payment['invoice_id'] ?? null,
                'table_id' => $payment['checkout']['table_id'] ?? null,
            ];
        }

        if (!$this->amountMatches($payment, $params)) {
            throw new RuntimeException('Số tiền VNPAY không khớp');
        }

        $invoice = $checkoutService->complete($payment['checkout'], $payment['staff_id'] ?? null);

        $payment['status'] = 'completed';
        $payment['invoice_id'] = $invoice->id;
        $payment['vnpay'] = $this->responseSummary($params);
        $payment['completed_at'] = now()->toIso8601String();

        Cache::put($key, $payment, now()->addDay());

        return [
            'invoice_id' => $invoice->id,
            'table_id' => $payment['checkout']['table_id'],
        ];
    }

    private function markPaymentFailed(string $txnRef, array $params): void
    {
        $key = $this->cacheKey($txnRef);
        $payment = Cache::get($key);

        if (!$payment) {
            return;
        }

        $payment['status'] = 'failed';
        $payment['vnpay'] = $this->responseSummary($params);
        $payment['failed_at'] = now()->toIso8601String();

        Cache::put($key, $payment, now()->addDay());
    }

    private function amountMatches(array $payment, array $params): bool
    {
        return (int) ($params['vnp_Amount'] ?? 0) === ((int) ($payment['amount'] ?? 0) * 100);
    }

    private function isSuccessfulVnpayResponse(array $params): bool
    {
        return ($params['vnp_ResponseCode'] ?? null) === '00'
            && ($params['vnp_TransactionStatus'] ?? null) === '00';
    }

    private function responseSummary(array $params): array
    {
        return [
            'txn_ref' => $params['vnp_TxnRef'] ?? null,
            'transaction_no' => $params['vnp_TransactionNo'] ?? null,
            'response_code' => $params['vnp_ResponseCode'] ?? null,
            'transaction_status' => $params['vnp_TransactionStatus'] ?? null,
            'bank_code' => $params['vnp_BankCode'] ?? null,
            'pay_date' => $params['vnp_PayDate'] ?? null,
        ];
    }

    private function makeTxnRef(int $tableId): string
    {
        return 'VNP' . now('Asia/Ho_Chi_Minh')->format('YmdHis') . $tableId . Str::upper(Str::random(6));
    }

    private function cacheKey(string $txnRef): string
    {
        return 'vnpay_payment_' . $txnRef;
    }
}
