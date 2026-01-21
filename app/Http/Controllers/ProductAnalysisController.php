<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Location;
use App\Models\CategoryProduct;
use Illuminate\Support\Facades\DB;

class ProductAnalysisController extends Controller
{
    public function index()
    {
        [$startDate, $endDate] = $this->resolveDateRange();

        $locationIds = $this->resolveLocationFilters();
        $categoryIds = $this->resolveCategoryFilters();
        $returnMode = request('returns', 'exclude');
        if (!in_array($returnMode, ['exclude', 'include'], true)) {
            $returnMode = 'exclude';
        }

        $analysis = $this->buildAnalysisData($startDate, $endDate, $locationIds, $categoryIds);
        $locations = Location::orderBy('name')->get(['id', 'name']);
        $categories = CategoryProduct::orderBy('name')->get(['id', 'name']);

        return view('pos.product-analysis', [
            'dateRange' => $startDate->format('d/m/Y') . ' - ' . $endDate->format('d/m/Y'),
            'fromDate' => $startDate->format('Y-m-d'),
            'toDate' => $endDate->format('Y-m-d'),
            'analysisData' => $analysis['charts'],
            'summary' => $analysis['summary'],
            'locations' => $locations,
            'categories' => $categories,
            'selectedLocationIds' => $locationIds,
            'selectedCategoryIds' => $categoryIds,
            'metaEndLabel' => $endDate->format('d/m/Y'),
            'returnMode' => $returnMode,
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

    private function resolveCategoryFilters(): array
    {
        $raw = (string) request('categories', '');
        if ($raw === '') {
            return [];
        }

        $ids = array_filter(array_map('intval', explode(',', $raw)), function ($id) {
            return $id > 0;
        });

        return array_values(array_unique($ids));
    }

    private function buildAnalysisData(
        Carbon $startDate,
        Carbon $endDate,
        array $locationIds,
        array $categoryIds
    ): array {
        $days = max($startDate->diffInDays($endDate) + 1, 1);

        $salesBase = $this->baseSalesQuery($startDate, $endDate, $locationIds, $categoryIds);
        $totalQuantity = (float) (clone $salesBase)->sum('d.quantity');
        $totalRevenue = (float) (clone $salesBase)->sum(DB::raw('d.quantity * d.price'));
        $totalProducts = (int) (clone $salesBase)->distinct('d.product_id')->count('d.product_id');

        $costFormula = 'COALESCE(d.quantity,0) * COALESCE(r.quantity,0) * COALESCE(ing.price,0)';
        $costBase = $this->baseCostQuery($startDate, $endDate, $locationIds, $categoryIds);
        $totalCost = (float) (clone $costBase)->sum(DB::raw($costFormula));
        $totalProfit = $totalRevenue - $totalCost;

        $avgRevenue = $totalProducts > 0 ? $totalRevenue / $totalProducts : 0.0;
        $avgProfit = $totalProducts > 0 ? $totalProfit / $totalProducts : 0.0;

        $dailySales = (clone $salesBase)
            ->select(
                DB::raw('DATE(i.time_end) as day'),
                DB::raw('SUM(d.quantity) as total_quantity'),
                DB::raw('SUM(d.quantity * d.price) as total_revenue'),
                DB::raw('COUNT(DISTINCT d.product_id) as total_products')
            )
            ->groupBy(DB::raw('DATE(i.time_end)'))
            ->get();

        $salesMap = [];
        foreach ($dailySales as $row) {
            $salesMap[$row->day] = $row;
        }

        $dailyCost = (clone $costBase)
            ->select(DB::raw('DATE(i.time_end) as day'), DB::raw("SUM($costFormula) as total_cost"))
            ->groupBy(DB::raw('DATE(i.time_end)'))
            ->pluck('total_cost', 'day')
            ->toArray();

        $labels = [];
        $productsSeries = [];
        $quantitySeries = [];
        $avgRevenueSeries = [];
        $avgProfitSeries = [];

        $cursor = $startDate->copy();
        for ($i = 0; $i < $days; $i += 1) {
            $dayKey = $cursor->format('Y-m-d');
            $row = $salesMap[$dayKey] ?? null;

            $products = $row ? (int) $row->total_products : 0;
            $quantity = $row ? (float) $row->total_quantity : 0.0;
            $revenue = $row ? (float) $row->total_revenue : 0.0;
            $cost = (float) ($dailyCost[$dayKey] ?? 0.0);
            $profit = $revenue - $cost;

            $labels[] = $cursor->format('d/m');
            $productsSeries[] = $products;
            $quantitySeries[] = $quantity;
            $avgRevenueSeries[] = $products > 0 ? $revenue / $products : 0.0;
            $avgProfitSeries[] = $products > 0 ? $profit / $products : 0.0;

            $cursor->addDay();
        }

        $categoryList = CategoryProduct::query()
            ->select('id', 'name')
            ->orderBy('name');
        if (!empty($categoryIds)) {
            $categoryList->whereIn('id', $categoryIds);
        }
        $categoryList = $categoryList->get();

        $categoryRevenueRows = (clone $salesBase)
            ->join('category_product as c', 'c.id', '=', 'p.category_id')
            ->select('c.id', DB::raw('SUM(d.quantity * d.price) as total_revenue'))
            ->groupBy('c.id')
            ->get();

        $categoryCostRows = (clone $costBase)
            ->join('category_product as c', 'c.id', '=', 'p.category_id')
            ->select('c.id', DB::raw("SUM($costFormula) as total_cost"))
            ->groupBy('c.id')
            ->get();

        $categoryRevenueMap = [];
        foreach ($categoryRevenueRows as $row) {
            $categoryRevenueMap[$row->id] = (float) $row->total_revenue;
        }

        $categoryCostMap = [];
        foreach ($categoryCostRows as $row) {
            $categoryCostMap[$row->id] = (float) $row->total_cost;
        }

        $categoryItems = [];
        foreach ($categoryList as $category) {
            $revenue = $categoryRevenueMap[$category->id] ?? 0.0;
            $cost = $categoryCostMap[$category->id] ?? 0.0;
            $profit = $revenue - $cost;
            $margin = $revenue > 0 ? ($profit / $revenue) * 100 : 0.0;

            $categoryItems[] = [
                'label' => $category->name,
                'revenue' => $revenue,
                'profit' => $profit,
                'margin' => $margin,
            ];
        }

        usort($categoryItems, function ($a, $b) {
            return $b['revenue'] <=> $a['revenue'];
        });

        $categoryLabels = array_map(function ($item) {
            return $item['label'];
        }, $categoryItems);
        $categoryRevenue = array_map(function ($item) {
            return $item['revenue'];
        }, $categoryItems);
        $categoryProfit = array_map(function ($item) {
            return $item['profit'];
        }, $categoryItems);
        $categoryMargin = array_map(function ($item) {
            return $item['margin'];
        }, $categoryItems);

        $inventoryBase = DB::table('product_available as pa')
            ->join('product as p', 'p.id', '=', 'pa.product_id')
            ->join('category_product as c', 'c.id', '=', 'p.category_id');
        if (!empty($categoryIds)) {
            $inventoryBase->whereIn('c.id', $categoryIds);
        }

        $inventoryTotals = (clone $inventoryBase)
            ->select(
                DB::raw('SUM(COALESCE(pa.available_qty, 0)) as total_qty'),
                DB::raw('SUM(COALESCE(pa.available_qty, 0) * COALESCE(pa.cost_per_dish, 0)) as total_value')
            )
            ->first();

        $inventoryTotalQty = (float) ($inventoryTotals->total_qty ?? 0.0);
        $inventoryTotalValue = (float) ($inventoryTotals->total_value ?? 0.0);

        $inventoryRows = (clone $inventoryBase)
            ->select('c.id', 'c.name', DB::raw('SUM(COALESCE(pa.available_qty, 0) * COALESCE(pa.cost_per_dish, 0)) as inventory_value'))
            ->groupBy('c.id', 'c.name')
            ->orderByDesc('inventory_value')
            ->get();

        $inventoryLabels = [];
        $inventoryValues = [];
        foreach ($inventoryRows as $row) {
            $inventoryLabels[] = $row->name;
            $inventoryValues[] = (float) $row->inventory_value;
        }

        $topRevenueRows = (clone $salesBase)
            ->select('p.name', DB::raw('SUM(d.quantity * d.price) as total_revenue'))
            ->groupBy('p.id', 'p.name')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        $topQuantityRows = (clone $salesBase)
            ->select('p.name', DB::raw('SUM(d.quantity) as total_quantity'))
            ->groupBy('p.id', 'p.name')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        $topRevenue = [];
        foreach ($topRevenueRows as $row) {
            $topRevenue[] = [
                'label' => $row->name,
                'value' => (float) $row->total_revenue,
            ];
        }

        $topQuantity = [];
        foreach ($topQuantityRows as $row) {
            $topQuantity[] = [
                'label' => $row->name,
                'value' => (float) $row->total_quantity,
            ];
        }

        $summary = [
            'products_sold' => number_format($totalProducts, 0, ',', '.'),
            'quantity_sold' => $this->formatDecimal($totalQuantity, 1),
            'avg_revenue' => $this->formatCompactCurrency($avgRevenue),
            'avg_profit' => $this->formatCompactCurrency($avgProfit),
            'inventory_qty' => $this->formatDecimal($inventoryTotalQty, 2),
            'inventory_value' => $this->formatCompactCurrency($inventoryTotalValue),
        ];

        return [
            'summary' => $summary,
            'charts' => [
                'trend' => [
                    'labels' => $labels,
                    'products' => $productsSeries,
                    'quantity' => $quantitySeries,
                    'avgRevenue' => $avgRevenueSeries,
                    'avgProfit' => $avgProfitSeries,
                ],
                'category' => [
                    'labels' => $categoryLabels,
                    'revenue' => $categoryRevenue,
                    'profit' => $categoryProfit,
                    'margin' => $categoryMargin,
                ],
                'inventory' => [
                    'labels' => $inventoryLabels,
                    'values' => $inventoryValues,
                ],
                'topProducts' => [
                    'revenue' => $topRevenue,
                    'quantity' => $topQuantity,
                ],
            ],
        ];
    }

    private function baseSalesQuery(
        Carbon $startDate,
        Carbon $endDate,
        array $locationIds,
        array $categoryIds
    ) {
        $query = DB::table('invoice_detail as d')
            ->join('invoice as i', 'i.id', '=', 'd.invoice_id')
            ->join('product as p', 'p.id', '=', 'd.product_id')
            ->leftJoin('users as u', 'u.id', '=', 'i.user_id')
            ->leftJoin('location as l', 'l.code', '=', 'u.location_code')
            ->where('i.status', 'completed')
            ->whereBetween('i.time_end', [$startDate, $endDate]);

        if (!empty($locationIds)) {
            $query->whereIn('l.id', $locationIds);
        }

        if (!empty($categoryIds)) {
            $query->whereIn('p.category_id', $categoryIds);
        }

        return $query;
    }

    private function baseCostQuery(
        Carbon $startDate,
        Carbon $endDate,
        array $locationIds,
        array $categoryIds
    ) {
        $query = DB::table('invoice_detail as d')
            ->join('invoice as i', 'i.id', '=', 'd.invoice_id')
            ->join('product as p', 'p.id', '=', 'd.product_id')
            ->leftJoin('users as u', 'u.id', '=', 'i.user_id')
            ->leftJoin('location as l', 'l.code', '=', 'u.location_code')
            ->leftJoin('recipe as r', 'r.product_id', '=', 'p.id')
            ->leftJoin('ingredient as ing', 'ing.id', '=', 'r.ingredient_id')
            ->where('i.status', 'completed')
            ->whereBetween('i.time_end', [$startDate, $endDate]);

        if (!empty($locationIds)) {
            $query->whereIn('l.id', $locationIds);
        }

        if (!empty($categoryIds)) {
            $query->whereIn('p.category_id', $categoryIds);
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
            return $sign . $this->formatDecimal($abs / 1000000000) . " tỷ";
        }
        if ($abs >= 1000000) {
            return $sign . $this->formatDecimal($abs / 1000000) . " triệu";
        }
        if ($abs >= 1000) {
            return $sign . $this->formatDecimal($abs / 1000) . " nghìn";
        }
        return $sign . number_format($abs, 0, ',', '.');
    }
}
