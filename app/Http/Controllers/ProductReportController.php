<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProductReportController extends Controller
{
    public function index()
    {
        [$startTime, $endTime, $dateLabel, $dateRangeValue, $fromDate, $toDate] = $this->resolveDateRange();

        $viewMode = request('view', 'table');
        if (!in_array($viewMode, ['table', 'cards', 'chart'], true)) {
            $viewMode = 'table';
        }

        $reportData = $this->buildReport($startTime, $endTime);

        return view('pos.product-report', $reportData + [
            'dateLabel' => $dateLabel,
            'dateRangeValue' => $dateRangeValue,
            'fromDate' => $fromDate,
            'toDate' => $toDate,
            'viewMode' => $viewMode,
        ]);
    }

    private function resolveDateRange(): array
    {
        $fromInput = request('fromDate');
        $toInput = request('toDate');

        if ($fromInput || $toInput) {
            try {
                $fromDate = $fromInput ? Carbon::parse($fromInput) : Carbon::parse($toInput);
                $toDate = $toInput ? Carbon::parse($toInput) : Carbon::parse($fromInput);

                $startTime = $fromDate->copy()->startOfDay();
                $endTime = $toDate->copy()->endOfDay();

                if ($startTime->greaterThan($endTime)) {
                    [$startTime, $endTime] = [$endTime, $startTime];
                }

                $label = $startTime->isSameDay($endTime)
                    ? 'Ngày ' . $startTime->format('d/m/Y')
                    : 'Từ ' . $startTime->format('d/m/Y') . ' - ' . $endTime->format('d/m/Y');

                $dateRangeValue = $startTime->format('d/m/Y') . ' - ' . $endTime->format('d/m/Y');

                return [
                    $startTime,
                    $endTime,
                    $label,
                    $dateRangeValue,
                    $startTime->format('Y-m-d'),
                    $endTime->format('Y-m-d'),
                ];
            } catch (\Exception $e) {
                // Fall back to default range.
            }
        }

        $startTime = Carbon::today()->startOfDay();
        $endTime = Carbon::now();

        return [$startTime, $endTime, 'Hôm nay', '', '', ''];
    }

    private function buildReport(Carbon $startTime, Carbon $endTime): array
    {
        $baseDetails = DB::table('invoice_detail as d')
            ->join('invoice as i', 'i.id', '=', 'd.invoice_id')
            ->where('i.status', 'completed')
            ->whereBetween('i.time_end', [$startTime, $endTime]);

        $topProducts = (clone $baseDetails)
            ->join('product as p', 'p.id', '=', 'd.product_id')
            ->select(
                'd.product_id',
                'p.name as product_name',
                DB::raw('SUM(d.quantity) as total_quantity'),
                DB::raw('SUM(d.quantity * d.price) as total_revenue')
            )
            ->groupBy('d.product_id', 'p.name')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        $productRevenues = (clone $baseDetails)
            ->join('product as p', 'p.id', '=', 'd.product_id')
            ->select(
                'd.product_id',
                'p.name as product_name',
                DB::raw('SUM(d.quantity) as total_quantity'),
                DB::raw('SUM(d.quantity * d.price) as total_revenue')
            )
            ->groupBy('d.product_id', 'p.name')
            ->orderByDesc('total_revenue')
            ->limit(20)
            ->get();

        $totalQuantity = (clone $baseDetails)->sum('d.quantity');
        $totalRevenue = (clone $baseDetails)->sum(DB::raw('d.quantity * d.price'));

        $rangeSeconds = $endTime->diffInSeconds($startTime) + 1;
        $prevEnd = $startTime->copy()->subSecond();
        $prevStart = $prevEnd->copy()->subSeconds(max(0, $rangeSeconds - 1));

        $prevDetails = DB::table('invoice_detail as d')
            ->join('invoice as i', 'i.id', '=', 'd.invoice_id')
            ->where('i.status', 'completed')
            ->whereBetween('i.time_end', [$prevStart, $prevEnd]);

        $prevQuantity = (clone $prevDetails)->sum('d.quantity');
        $prevRevenue = (clone $prevDetails)->sum(DB::raw('d.quantity * d.price'));

        return [
            'startTime' => $startTime,
            'endTime' => $endTime,
            'topProducts' => $topProducts,
            'productRevenues' => $productRevenues,
            'totalQuantity' => $totalQuantity,
            'totalRevenue' => $totalRevenue,
            'prevQuantity' => $prevQuantity,
            'prevRevenue' => $prevRevenue,
            'prevStart' => $prevStart,
            'prevEnd' => $prevEnd,
        ];
    }
}
