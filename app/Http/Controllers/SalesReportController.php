<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SalesReportController extends Controller
{
    public function index()
    {
        [$startTime, $endTime, $dateLabel, $dateRangeValue, $fromDate, $toDate] = $this->resolveDateRange();

        $viewMode = request('view', 'table');
        if (!in_array($viewMode, ['table', 'cards', 'chart'], true)) {
            $viewMode = 'table';
        }

        $groupMode = request('group');
        $validGroups = ['hour', 'day', 'week', 'month', 'year'];
        if (!$groupMode || !in_array($groupMode, $validGroups, true)) {
            $groupMode = $startTime->isSameDay($endTime) ? 'hour' : 'day';
        }

        $groupLabelMap = [
            'hour' => 'Theo giờ',
            'day' => 'Theo ngày',
            'week' => 'Theo tuần',
            'month' => 'Theo tháng',
            'year' => 'Theo năm',
        ];
        $groupLabel = $groupLabelMap[$groupMode] ?? 'Theo ngày';

        $reportData = $this->buildReport($startTime, $endTime, $groupMode);
        [$minYear, $maxYear] = $this->resolveYearBounds();

        return view('pos.sales-report', $reportData + [
            'dateLabel' => $dateLabel,
            'dateRangeValue' => $dateRangeValue,
            'fromDate' => $fromDate,
            'toDate' => $toDate,
            'viewMode' => $viewMode,
            'groupMode' => $groupMode,
            'groupLabel' => $groupLabel,
            'minYear' => $minYear,
            'maxYear' => $maxYear,
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
            }
        }

        $startTime = Carbon::today()->startOfDay();
        $endTime = Carbon::now();

        return [$startTime, $endTime, 'Hôm nay', '', '', ''];
    }

    private function buildReport(Carbon $startTime, Carbon $endTime, string $groupMode): array
    {
        $baseInvoices = DB::table('invoice as i')
            ->where('i.status', 'completed')
            ->whereBetween('i.time_end', [$startTime, $endTime]);

        $bucketSelect = [
            'hour' => [
                "DATE_FORMAT(i.time_end, '%Y-%m-%d %H:00:00') as bucket_value",
                "DATE_FORMAT(i.time_end, '%H:00') as bucket_label",
            ],
            'day' => [
                'DATE(i.time_end) as bucket_value',
                "DATE_FORMAT(i.time_end, '%d/%m/%Y') as bucket_label",
            ],
            'week' => [
                'YEARWEEK(i.time_end, 1) as bucket_value',
                "CONCAT('Tuần ', DATE_FORMAT(i.time_end, '%v/%x')) as bucket_label",
            ],
            'month' => [
                "DATE_FORMAT(i.time_end, '%Y-%m') as bucket_value",
                "DATE_FORMAT(i.time_end, '%m/%Y') as bucket_label",
            ],
            'year' => [
                'YEAR(i.time_end) as bucket_value',
                "DATE_FORMAT(i.time_end, '%Y') as bucket_label",
            ],
        ];

        $bucketParts = $bucketSelect[$groupMode] ?? $bucketSelect['day'];

        $timeBuckets = (clone $baseInvoices)
            ->select(
                DB::raw($bucketParts[0]),
                DB::raw($bucketParts[1]),
                DB::raw('SUM(i.pay_amount) as total_revenue'),
                DB::raw('COUNT(*) as total_invoices')
            )
            ->groupBy('bucket_value', 'bucket_label')
            ->orderBy('bucket_value')
            ->get();

        $totalRevenue = (clone $baseInvoices)->sum('i.pay_amount');
        $totalInvoices = (clone $baseInvoices)->count();

        return [
            'startTime' => $startTime,
            'endTime' => $endTime,
            'timeBuckets' => $timeBuckets,
            'totalRevenue' => $totalRevenue,
            'totalInvoices' => $totalInvoices,
            'groupMode' => $groupMode,
        ];
    }

    private function resolveYearBounds(): array
    {
        $minTime = DB::table('invoice')
            ->where('status', 'completed')
            ->whereNotNull('time_end')
            ->min('time_end');
        $maxTime = DB::table('invoice')
            ->where('status', 'completed')
            ->whereNotNull('time_end')
            ->max('time_end');

        if (!$minTime || !$maxTime) {
            $year = (int) Carbon::now()->format('Y');
            return [$year, $year];
        }

        $minYear = (int) Carbon::parse($minTime)->format('Y');
        $maxYear = (int) Carbon::parse($maxTime)->format('Y');

        if ($minYear > $maxYear) {
            [$minYear, $maxYear] = [$maxYear, $minYear];
        }

        return [$minYear, $maxYear];
    }
}
