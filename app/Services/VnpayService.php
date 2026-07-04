<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Http\Request;
use RuntimeException;

class VnpayService
{
    public function createPaymentUrl(string $txnRef, int $amount, string $orderInfo, Request $request, ?string $bankCode = null): string
    {
        if ($amount <= 0) {
            throw new RuntimeException('Invalid VNPAY amount.');
        }

        $paymentUrl = $this->configValue('url');
        $tmnCode = $this->configValue('tmn_code');
        $hashSecret = $this->configValue('hash_secret');
        $now = Carbon::now('Asia/Ho_Chi_Minh');
        $expiresAt = $now->copy()->addMinutes((int) config('services.vnpay.expires_minutes', 15));

        $params = [
            'vnp_Version' => '2.1.0',
            'vnp_Command' => 'pay',
            'vnp_TmnCode' => $tmnCode,
            'vnp_Amount' => (string) ($amount * 100),
            'vnp_CreateDate' => $now->format('YmdHis'),
            'vnp_CurrCode' => 'VND',
            'vnp_IpAddr' => $request->ip() ?: '127.0.0.1',
            'vnp_Locale' => (string) config('services.vnpay.locale', 'vn'),
            'vnp_OrderInfo' => $this->normalizeOrderInfo($orderInfo),
            'vnp_OrderType' => (string) config('services.vnpay.order_type', 'other'),
            'vnp_ReturnUrl' => (string) (config('services.vnpay.return_url') ?: route('vnpay.return')),
            'vnp_TxnRef' => $txnRef,
            'vnp_ExpireDate' => $expiresAt->format('YmdHis'),
        ];

        $bankCode = $bankCode ?: config('services.vnpay.bank_code');
        if (!empty($bankCode)) {
            $params['vnp_BankCode'] = (string) $bankCode;
        }

        ksort($params);

        $query = http_build_query($params, '', '&', PHP_QUERY_RFC1738);
        $secureHash = hash_hmac('sha512', $query, $hashSecret);

        return $paymentUrl . '?' . $query . '&vnp_SecureHash=' . $secureHash;
    }

    public function verifySignature(array $params): bool
    {
        $hashSecret = $this->configValue('hash_secret');
        $secureHash = $params['vnp_SecureHash'] ?? null;

        if (!$secureHash) {
            return false;
        }

        $data = [];
        foreach ($params as $key => $value) {
            if (!str_starts_with((string) $key, 'vnp_')) {
                continue;
            }

            if (in_array($key, ['vnp_SecureHash', 'vnp_SecureHashType'], true)) {
                continue;
            }

            if ($value !== null) {
                $data[$key] = (string) $value;
            }
        }

        ksort($data);

        $hashData = http_build_query($data, '', '&', PHP_QUERY_RFC1738);
        $expectedHash = hash_hmac('sha512', $hashData, $hashSecret);

        return hash_equals($expectedHash, (string) $secureHash);
    }

    private function configValue(string $key): string
    {
        $value = config("services.vnpay.{$key}");

        if (!is_string($value) || trim($value) === '') {
            throw new RuntimeException("Missing VNPAY config: {$key}.");
        }

        return trim($value);
    }

    private function normalizeOrderInfo(string $orderInfo): string
    {
        $normalized = preg_replace('/[^A-Za-z0-9 .:_-]/', '', $orderInfo) ?: 'Thanh toan hoa don';

        return substr(trim($normalized), 0, 255);
    }
}
