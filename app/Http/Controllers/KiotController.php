<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Invoice;

class KiotController extends Controller
{
    public function index()
    {
        $todayRevenue = DB::table('invoice')
        ->where('status', 'completed')
        ->whereDate('time_end', Carbon::today())
        ->sum('pay_amount');

        $completedOrders = DB::table('invoice')
        ->where('status', 'completed')
        ->whereDate('time_end', Carbon::today())
        ->count();

        $servicingTables = DB::table('invoice')
        ->where('status', 'serving')
        ->distinct('table_id')
        ->count('table_id');

    return view('pos.kiot', compact('todayRevenue', 'completedOrders', 'servicingTables'));
    }

    public function revenue(Request $request)
    {
        $mode  = $request->mode ?? 'hour';
        $range = $request->range ?? 'today';

        [$from, $to] = $this->resolveRange($range);

        return response()->json(
            $this->buildInvoiceSeries($mode, $range, $from, $to, 'SUM(pay_amount)')
        );
    }

    public function orders(Request $request)
    {
        $mode  = $request->mode ?? 'hour';
        $range = $request->range ?? 'today';

        [$from, $to] = $this->resolveRange($range);

        return response()->json(
            $this->buildInvoiceSeries($mode, $range, $from, $to, 'COUNT(*)')
        );
    }

    public function products(Request $request)
    {
        $range  = $request->range;
        $metric = $request->metric ?? 'quantity';

        [$from, $to] = $this->resolveRange($range);

        $query = DB::table('invoice_detail as d')
            ->join('invoice as i', 'i.id', '=', 'd.invoice_id')
            ->join('product as p', 'p.id', '=', 'd.product_id')
            ->where('i.status', 'completed')
            ->whereBetween('i.time_end', [$from, $to]);

        if ($metric === 'revenue') {
            $query->selectRaw('p.name as label, SUM(d.quantity * d.price) as total');
        } else {
            $query->selectRaw('p.name as label, SUM(d.quantity) as total');
        }

        $data = $query
            ->groupBy('p.id', 'p.name')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        return response()->json($data);
    }

    private function resolveRange($range)
    {
        $now = now();

        switch ($range) {
            case 'today':
                return [$now->copy()->startOfDay(), $now->copy()->endOfDay()];
            case 'yesterday':
                return [
                    $now->copy()->subDay()->startOfDay(),
                    $now->copy()->subDay()->endOfDay()
                ];
            case '7days':
                return [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()];
            case 'this_month':
                return [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
            case 'last_month':
                return [
                    $now->copy()->subMonth()->startOfMonth(),
                    $now->copy()->subMonth()->endOfMonth()
                ];
        }

        return [$now->copy()->startOfDay(), $now->copy()->endOfDay()];
    }

    private function buildInvoiceSeries(string $mode, string $range, Carbon $from, Carbon $to, string $aggregate): array
    {
        $mode = in_array($mode, ['hour', 'day', 'weekday'], true) ? $mode : 'hour';

        $labelExpression = match ($mode) {
            'day' => 'DATE(time_end)',
            'weekday' => 'DAYOFWEEK(time_end)',
            default => 'HOUR(time_end)',
        };

        $totals = Invoice::where('status', 'completed')
            ->whereBetween('time_end', [$from, $to])
            ->selectRaw($labelExpression . ' as label, ' . $aggregate . ' as total')
            ->groupByRaw($labelExpression)
            ->pluck('total', 'label')
            ->mapWithKeys(function ($total, $label) {
                return [(string) $label => (float) $total];
            });

        if ($mode === 'hour') {
            return $this->fillHourSeries($totals);
        }

        if ($mode === 'weekday') {
            return $this->fillWeekdaySeries($totals, $range, $from);
        }

        return $this->fillDaySeries($totals, $range, $from, $to);
    }

    private function fillHourSeries($totals): array
    {
        $series = [];

        for ($hour = 0; $hour <= 23; $hour++) {
            $series[] = [
                'label' => $hour,
                'total' => (float) ($totals[(string) $hour] ?? 0),
            ];
        }

        return $series;
    }

    private function fillDaySeries($totals, string $range, Carbon $from, Carbon $to): array
    {
        $series = [];

        $cursor = $from->copy()->startOfDay();
        $end = $to->copy()->startOfDay();

        while ($cursor->lte($end)) {
            $key = $cursor->toDateString();
            $series[] = [
                'label' => $key,
                'total' => (float) ($totals[$key] ?? 0),
            ];
            $cursor->addDay();
        }

        return $series;
    }

    private function fillWeekdaySeries($totals, string $range, Carbon $from): array
    {
        if (in_array($range, ['today', 'yesterday'], true)) {
            $label = $this->mysqlDayOfWeek($from);

            return [[
                'label' => $label,
                'total' => (float) ($totals[(string) $label] ?? 0),
            ]];
        }

        $series = [];
        for ($weekday = 2; $weekday <= 7; $weekday++) {
            $series[] = [
                'label' => $weekday,
                'total' => (float) ($totals[(string) $weekday] ?? 0),
            ];
        }

        return $series;
    }

    private function mysqlDayOfWeek(Carbon $date): int
    {
        return $date->dayOfWeek === Carbon::SUNDAY
            ? 1
            : $date->dayOfWeek + 1;
    }

}
