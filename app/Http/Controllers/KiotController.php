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
        $mode  = $request->mode;   // hour | day | weekday
        $range = $request->range;  // today | yesterday | 7days ...

        [$from, $to] = $this->resolveRange($range);

        $query = Invoice::where('status', 'completed')
            ->whereBetween('time_end', [$from, $to]);

        if ($mode === 'hour') {
            $data = $query
                ->selectRaw('HOUR(time_end) as label, SUM(pay_amount) as total')
                ->groupByRaw('HOUR(time_end)')
                ->orderBy('label')
                ->get();
        }

        if ($mode === 'day') {
            $data = $query
                ->selectRaw('DATE(time_end) as label, SUM(pay_amount) as total')
                ->groupByRaw('DATE(time_end)')
                ->orderBy('label')
                ->get();
        }

        if ($mode === 'weekday') {
            $data = $query
                ->selectRaw('DAYOFWEEK(time_end) as label, SUM(pay_amount) as total')
                ->groupByRaw('DAYOFWEEK(time_end)')
                ->orderBy('label')
                ->get();
        }

        return response()->json($data);
    }

    public function orders(Request $request)
    {
        $mode  = $request->mode;
        $range = $request->range;

        [$from, $to] = $this->resolveRange($range);

        $query = Invoice::where('status', 'completed')
            ->whereBetween('time_end', [$from, $to]);

        if ($mode === 'hour') {
            $data = $query
                ->selectRaw('HOUR(time_end) as label, COUNT(*) as total')
                ->groupByRaw('HOUR(time_end)')
                ->orderBy('label')
                ->get();
        }

        if ($mode === 'day') {
            $data = $query
                ->selectRaw('DATE(time_end) as label, COUNT(*) as total')
                ->groupByRaw('DATE(time_end)')
                ->orderBy('label')
                ->get();
        }

        if ($mode === 'weekday') {
            $data = $query
                ->selectRaw('DAYOFWEEK(time_end) as label, COUNT(*) as total')
                ->groupByRaw('DAYOFWEEK(time_end)')
                ->orderBy('label')
                ->get();
        }

        return response()->json($data);
    }

    public function products(Request $request)
    {
        $range  = $request->range;
        $metric = $request->metric ?? 'quantity'; // quantity | revenue

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
        switch ($range) {
            case 'today':
                return [now()->startOfDay(), now()->endOfDay()];
            case 'yesterday':
                return [
                    now()->subDay()->startOfDay(),
                    now()->subDay()->endOfDay()
                ];
            case '7days':
                return [now()->subDays(6)->startOfDay(), now()->endOfDay()];
            case 'this_month':
                return [now()->startOfMonth(), now()->endOfMonth()];
            case 'last_month':
                return [
                    now()->subMonth()->startOfMonth(),
                    now()->subMonth()->endOfMonth()
                ];
        }
    }

}
