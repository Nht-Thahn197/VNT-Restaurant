<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BankTransaction;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        Log::info('Payment Webhook Received:', $request->all());

        // Hỗ trợ định dạng Casso (data là array) hoặc SePay/PayOS (data hoặc request trực tiếp là object)
        $transactions = [];

        if ($request->has('data') && is_array($request->input('data'))) {
            // Định dạng Casso: { "data": [ { ... } ] }
            $transactions = $request->input('data');
        } elseif ($request->has('amount') || $request->has('transferAmount')) {
            // Định dạng trực tiếp
            $transactions = [$request->all()];
        }

        if (empty($transactions) && $request->has('data') && is_object($request->input('data'))) {
            $transactions = [$request->input('data')];
        }

        if (empty($transactions)) {
            return response()->json(['error' => 'No transaction data found'], 400);
        }

        $recordedCount = 0;
        foreach ($transactions as $txn) {
            $gatewayTxnId = $txn['id'] ?? $txn['transactionId'] ?? null;
            $amount = (float) ($txn['amount'] ?? $txn['transferAmount'] ?? 0);
            
            // Chấp nhận các trường mô tả giao dịch khác nhau
            $description = $txn['description'] ?? $txn['content'] ?? $txn['code'] ?? '';
            $referenceCode = $txn['referenceCode'] ?? $txn['reference_code'] ?? $txn['reference'] ?? null;
            $accountNumber = $txn['accountNumber'] ?? $txn['account_number'] ?? $txn['subAccount'] ?? null;

            if ($amount <= 0 || empty($description)) {
                continue;
            }

            // Tránh trùng mã giao dịch cổng thanh toán
            $exists = false;
            if ($gatewayTxnId) {
                $exists = BankTransaction::where('gateway_transaction_id', $gatewayTxnId)->exists();
            }

            if (!$exists) {
                BankTransaction::create([
                    'gateway_transaction_id' => $gatewayTxnId,
                    'amount' => $amount,
                    'description' => $description,
                    'reference_code' => $referenceCode,
                    'account_number' => $accountNumber,
                    'status' => 'pending',
                ]);
                $recordedCount++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully recorded $recordedCount transaction(s)."
        ]);
    }
}
