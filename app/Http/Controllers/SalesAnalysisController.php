<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Location;
use Illuminate\Support\Facades\DB;

class SalesAnalysisController extends Controller
{
    public function index()
    {
        [$startDate, $endDate] = $this->resolveDateRange();

        $locationIds = $this->resolveLocationFilters();
        $analysisData = $this->buildAnalysisData($startDate, $endDate, $locationIds);
        $locations = Location::orderBy('name')->get(['id', 'name']);

        return view('pos.sales-analysis', [
            'dateRange' => $startDate->format('d/m/Y') . ' - ' . $endDate->format('d/m/Y'),
            'fromDate' => $startDate->format('Y-m-d'),
            'toDate' => $endDate->format('Y-m-d'),
            'analysisData' => $analysisData,
            'locations' => $locations,
            'selectedLocationIds' => $locationIds,
            'metaEndLabel' => $endDate->format('d/m/Y'),
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

                $startDate = $fromDate->copy()->startOfDay();
                $endDate = $toDate->copy()->endOfDay();

                if ($startDate->greaterThan($endDate)) {
                    [$startDate, $endDate] = [$endDate, $startDate];
                }

                return [$startDate, $endDate];
            } catch (\Exception $e) {
            }
        }

        $endDate = Carbon::now()->endOfDay();
        $startDate = Carbon::now()->subDays(61)->startOfDay();

        return [$startDate, $endDate];
    }

    private function resolveLocationFilters(): array
    {
        $raw = (string) request('locations', '');
        if ($raw === '') {
            return [];
        }

        $ids = array_filter(array_map('intval', explode(',', $raw)), function ($id) {
            return $id > 0;
        });

        return array_values(array_unique($ids));
    }

    private function buildAnalysisData(Carbon $startDate, Carbon $endDate, array $locationIds): array
    {
        $days = max($startDate->diffInDays($endDate) + 1, 1);

        $invoiceBase = $this->baseInvoiceQuery($startDate, $endDate, $locationIds);
        $totalRevenue = (float) (clone $invoiceBase)->sum('i.pay_amount');
        $totalInvoices = (int) (clone $invoiceBase)->count('i.id');
        $totalReturns = 0.0;

        $costFormula = 'COALESCE(d.quantity,0) * COALESCE(r.quantity,0) * COALESCE(ing.price,0)';
        $costBase = $this->baseCostQuery($startDate, $endDate, $locationIds);
        $totalCost = (float) (clone $costBase)->sum(DB::raw($costFormula));
        $totalProfit = $totalRevenue - $totalReturns - $totalCost;

        $dailyRevenue = (clone $invoiceBase)
            ->select(DB::raw('DATE(i.time_end) as day'), DB::raw('SUM(i.pay_amount) as total_revenue'))
            ->groupBy(DB::raw('DATE(i.time_end)'))
            ->pluck('total_revenue', 'day')
            ->toArray();

        $dailyCost = (clone $costBase)
            ->select(DB::raw('DATE(i.time_end) as day'), DB::raw("SUM($costFormula) as total_cost"))
            ->groupBy(DB::raw('DATE(i.time_end)'))
            ->pluck('total_cost', 'day')
            ->toArray();

        $labels = [];
        $revenueSeries = [];
        $returnSeries = [];
        $costSeries = [];
        $profitSeries = [];
        $weekdayTotals = array_fill(1, 7, 0.0);
        $weekdayCounts = array_fill(1, 7, 0);

        $cursor = $startDate->copy();
        for ($i = 0; $i < $days; $i += 1) {
            $dayKey = $cursor->format('Y-m-d');
            $revenue = (float) ($dailyRevenue[$dayKey] ?? 0);
            $cost = (float) ($dailyCost[$dayKey] ?? 0);
            $returns = 0.0;
            $profit = $revenue - $returns - $cost;

            $labels[] = $cursor->format('d/m');
            $revenueSeries[] = $revenue;
            $returnSeries[] = $returns;
            $costSeries[] = $cost;
            $profitSeries[] = $profit;

            $weekdayIndex = $cursor->dayOfWeekIso;
            $weekdayTotals[$weekdayIndex] += $revenue;
            $weekdayCounts[$weekdayIndex] += 1;

            $cursor->addDay();
        }

        $weekdayLabels = [
            1 => 'Thứ 2',
            2 => 'Thứ 3',
            3 => 'Thứ 4',
            4 => 'Thứ 5',
            5 => 'Thứ 6',
            6 => 'Thứ 7',
            7 => 'CN',
        ];

        $weekdayData = [];
        foreach ($weekdayLabels as $index => $label) {
            $avg = $weekdayCounts[$index] > 0 ? $weekdayTotals[$index] / $weekdayCounts[$index] : 0;
            $weekdayData[] = [
                'label' => $label,
                'value' => $avg,
            ];
        }

        $hourTotals = (clone $invoiceBase)
            ->select(DB::raw('HOUR(i.time_end) as hour'), DB::raw('SUM(i.pay_amount) as total_revenue'))
            ->groupBy(DB::raw('HOUR(i.time_end)'))
            ->pluck('total_revenue', 'hour')
            ->toArray();

        $hourData = [];
        for ($hour = 0; $hour < 24; $hour += 1) {
            $total = (float) ($hourTotals[$hour] ?? 0);
            $hourData[] = [
                'label' => (string) $hour,
                'value' => $total / $days,
            ];
        }

        $channelRows = (clone $invoiceBase)
            ->leftJoin('dining_table as t', 't.id', '=', 'i.table_id')
            ->leftJoin('area as a', 'a.id', '=', 't.area_id')
            ->select(DB::raw("CASE WHEN LOWER(a.name) = 'app' THEN 'App' ELSE 'Bán trực tiếp' END as channel"), DB::raw('SUM(i.pay_amount) as total_revenue'))
            ->groupBy('channel')
            ->get();

        $channelTotals = [
            'Bán trực tiếp' => 0.0,
            'App' => 0.0,
        ];
        foreach ($channelRows as $row) {
            $channelTotals[$row->channel] = (float) $row->total_revenue;
        }

        $channelData = [];
        foreach ($channelTotals as $label => $value) {
            $channelData[] = [
                'label' => $label,
                'value' => $value,
            ];
        }

        $staffRows = (clone $invoiceBase)
            ->select('u.name', DB::raw('SUM(i.pay_amount) as total_revenue'))
            ->groupBy('u.id', 'u.name')
            ->orderByDesc('total_revenue')
            ->limit(7)
            ->get();

        $staffData = [];
        foreach ($staffRows as $row) {
            $staffData[] = [
                'label' => $row->name ?: 'Không rõ',
                'value' => (float) $row->total_revenue,
            ];
        }

        $branchRevenue = (clone $invoiceBase)
            ->select('l.id', 'l.name', DB::raw('SUM(i.pay_amount) as total_revenue'))
            ->groupBy('l.id', 'l.name')
            ->get();

        $branchCost = (clone $costBase)
            ->select('l.id', 'l.name', DB::raw("SUM($costFormula) as total_cost"))
            ->groupBy('l.id', 'l.name')
            ->get();

        $branchMap = [];
        foreach ($branchRevenue as $row) {
            $key = $row->id ?? 'unknown';
            $branchMap[$key] = [
                'name' => $row->name ?: 'Không rõ',
                'revenue' => (float) $row->total_revenue,
                'returns' => 0.0,
                'cost' => 0.0,
            ];
        }
        foreach ($branchCost as $row) {
            $key = $row->id ?? 'unknown';
            if (!isset($branchMap[$key])) {
                $branchMap[$key] = [
                    'name' => $row->name ?: 'Không rõ',
                    'revenue' => 0.0,
                    'returns' => 0.0,
                    'cost' => 0.0,
                ];
            }
            $branchMap[$key]['cost'] = (float) $row->total_cost;
        }

        $branchRows = [];
        foreach ($branchMap as $branch) {
            $net = $branch['revenue'] - $branch['returns'];
            $profit = $net - $branch['cost'];
            $margin = $branch['revenue'] > 0 ? $profit / $branch['revenue'] : 0;

            $branchRows[] = [
                'name' => $branch['name'],
                'revenue' => $branch['revenue'],
                'returns' => $branch['returns'],
                'net' => $net,
                'profit' => $profit,
                'margin' => $margin,
            ];
        }

        $metrics = [
            [
                'label' => 'Số hóa đơn',
                'value' => number_format($totalInvoices, 0, ',', '.'),
                'sub' => $this->formatDecimal($totalInvoices / $days) . ' đơn/ngày',
                'icon' => 'fa-solid fa-receipt',
                'tone' => 'neutral',
            ],
            [
                'label' => 'Doanh thu',
                'value' => $this->formatCompactCurrency($totalRevenue),
                'sub' => $this->formatCompactCurrency($totalRevenue / $days) . '/ngày',
                'icon' => 'fa-solid fa-money-bill-trend-up',
                'tone' => 'primary',
            ],
            [
                'label' => 'Trả hàng',
                'value' => $this->formatCompactCurrency($totalReturns),
                'sub' => $this->formatCompactCurrency($totalReturns / $days) . '/ngày',
                'icon' => 'fa-solid fa-rotate-left',
                'tone' => 'danger',
            ],
            [
                'label' => 'Doanh thu thuần',
                'value' => $this->formatCompactCurrency($totalRevenue - $totalReturns),
                'sub' => $this->formatCompactCurrency(($totalRevenue - $totalReturns) / $days) . '/ngày',
                'icon' => 'fa-solid fa-wallet',
                'tone' => 'info',
            ],
            [
                'label' => 'Tổng giá vốn',
                'value' => $this->formatCompactCurrency($totalCost),
                'sub' => $this->formatCompactCurrency($totalCost / $days) . '/ngày',
                'icon' => 'fa-solid fa-sack-dollar',
                'tone' => 'warning',
            ],
            [
                'label' => 'Lợi nhuận gộp',
                'value' => $this->formatCompactCurrency($totalProfit),
                'sub' => $this->formatCompactCurrency($totalProfit / $days) . '/ngày',
                'icon' => 'fa-solid fa-file-invoice-dollar',
                'tone' => 'success',
            ],
        ];

        return [
            'metrics' => $metrics,
            'trend' => [
                'labels' => $labels,
                'revenue' => $revenueSeries,
                'returns' => $returnSeries,
                'cost' => $costSeries,
                'profit' => $profitSeries,
            ],
            'channels' => $channelData,
            'weekday' => $weekdayData,
            'hour' => $hourData,
            'staff' => $staffData,
            'branch' => $branchRows,
            'totals' => [
                'revenue' => $totalRevenue,
                'returns' => $totalReturns,
                'net' => $totalRevenue - $totalReturns,
                'profit' => $totalProfit,
                'margin' => $totalRevenue > 0 ? $totalProfit / $totalRevenue : 0,
            ],
        ];
    }

    private function baseInvoiceQuery(Carbon $startDate, Carbon $endDate, array $locationIds)
    {
        $query = DB::table('invoice as i')
            ->leftJoin('users as u', 'u.id', '=', 'i.user_id')
            ->leftJoin('location as l', 'l.code', '=', 'u.location_code')
            ->where('i.status', 'completed')
            ->whereBetween('i.time_end', [$startDate, $endDate]);

        if (!empty($locationIds)) {
            $query->whereIn('l.id', $locationIds);
        }

        return $query;
    }

    private function baseCostQuery(Carbon $startDate, Carbon $endDate, array $locationIds)
    {
        $query = DB::table('invoice as i')
            ->leftJoin('users as u', 'u.id', '=', 'i.user_id')
            ->leftJoin('location as l', 'l.code', '=', 'u.location_code')
            ->leftJoin('invoice_detail as d', 'd.invoice_id', '=', 'i.id')
            ->leftJoin('recipe as r', 'r.product_id', '=', 'd.product_id')
            ->leftJoin('ingredient as ing', 'ing.id', '=', 'r.ingredient_id')
            ->where('i.status', 'completed')
            ->whereBetween('i.time_end', [$startDate, $endDate]);

        if (!empty($locationIds)) {
            $query->whereIn('l.id', $locationIds);
        }

        return $query;
    }

    private function formatDecimal(float $value, int $precision = 2): string
    {
        $text = number_format($value, $precision, '.', '');
        $text = rtrim(rtrim($text, '0'), '.');
        return $text === '' ? '0' : $text;
    }

    private function formatCompactCurrency(float $value): string
    {
        $sign = $value < 0 ? '-' : '';
        $abs = abs($value);

        if ($abs >= 1000000000) {
            return $sign . $this->formatDecimal($abs / 1000000000) . ' tỷ';
        }
        if ($abs >= 1000000) {
            return $sign . $this->formatDecimal($abs / 1000000) . ' triệu';
        }
        if ($abs >= 1000) {
            return $sign . $this->formatDecimal($abs / 1000) . ' nghìn';
        }
        return $sign . number_format($abs, 0, ',', '.');
    }

}
