<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DailyReportController extends Controller
{
    public function index()
    {
        $startTime = Carbon::today()->startOfDay();
        $endTime = Carbon::now();

        $reportData = $this->buildReport($startTime, $endTime);

        return view('pos.daily-report', $reportData);
    }

    public function closeDay()
    {
        $startTime = Carbon::today()->startOfDay();
        $endTime = Carbon::now();

        $reportData = $this->buildReport($startTime, $endTime);

        return response()->json([
            'success' => true,
            'report' => $reportData['report'],
            'imports' => $reportData['imports'],
            'start_time' => $startTime,
            'end_time' => $endTime,
        ]);
    }

    private function buildReport(Carbon $startTime, Carbon $endTime): array
    {
        $cashAmount = DB::table('invoice')
            ->where('status', 'completed')
            ->where('payment_method', 'cash')
            ->whereBetween('time_end', [$startTime, $endTime])
            ->sum('pay_amount');

        $transferAmount = DB::table('invoice')
            ->where('status', 'completed')
            ->where('payment_method', 'transfer')
            ->whereBetween('time_end', [$startTime, $endTime])
            ->sum('pay_amount');

        $cardAmount = DB::table('invoice')
            ->where('status', 'completed')
            ->where('payment_method', 'card')
            ->whereBetween('time_end', [$startTime, $endTime])
            ->sum('pay_amount');

        $grossRevenue = DB::table('invoice')
            ->where('status', 'completed')
            ->whereBetween('time_end', [$startTime, $endTime])
            ->sum('total');
        $totalDiscount = DB::table('invoice')
            ->where('status', 'completed')
            ->whereBetween('time_end', [$startTime, $endTime])
            ->sum('discount');
        $netRevenue = DB::table('invoice')
            ->where('status', 'completed')
            ->whereBetween('time_end', [$startTime, $endTime])
            ->sum('pay_amount');

        $successInvoice = DB::table('invoice')
            ->where('status', 'completed')
            ->whereBetween('time_end', [$startTime, $endTime])
            ->count();
        $cancelInvoice = DB::table('invoice')
            ->where('status', 'cancel')
            ->whereBetween('time_end', [$startTime, $endTime])
            ->count();
        $imports = DB::table('inventory_log')
            ->where('type', 'import')
            ->whereBetween('created_at', [$startTime, $endTime])
            ->orderByDesc('created_at')
            ->get();
        $totalExpense = DB::table('inventory_log')
            ->where('type', 'import')
            ->whereBetween('created_at', [$startTime, $endTime])
            ->sum('total_price');
        $profit = $netRevenue - $totalExpense;

        $report = [
            'cash' => $cashAmount,
            'transfer' => $transferAmount,
            'card' => $cardAmount,
            'gross_revenue' => $grossRevenue,
            'discount' => $totalDiscount,
            'net_revenue' => $netRevenue,
            'success_invoice' => $successInvoice,
            'cancel_invoice' => $cancelInvoice,
            'total_expense' => $totalExpense,
            'profit' => $profit,
            'closed_at' => now(),
        ];

        return [
            'report' => $report,
            'imports' => $imports,
            'startTime' => $startTime,
            'endTime' => $endTime,
        ];
    }
}
