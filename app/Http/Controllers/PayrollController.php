<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->query('month');
        $status = $request->query('status');
        $search = trim((string) $request->query('q', ''));

        $latestPayroll = DB::table('payroll as p1')
            ->select(
                'p1.staff_id',
                DB::raw('MAX(p1.id) as id')
            )
            ->groupBy('p1.staff_id');

        if ($month) {
            $latestPayroll->where('p1.month', $month);
        }

        if ($status) {
            $latestPayroll->where('p1.status', $status);
        }

        $query = DB::table('users as u')
            ->leftJoinSub($latestPayroll, 'latest_payroll', function ($join) {
                $join->on('u.id', '=', 'latest_payroll.staff_id');
            })
            ->leftJoin('payroll as p', 'p.id', '=', 'latest_payroll.id')
            ->select(
                'p.*',
                'u.id as staff_id',
                'u.name as staff_name',
                'u.code as staff_code'
            )
            ->whereNotNull('p.id')
            ->orderByDesc('p.month')
            ->orderByDesc('p.id')
            ->orderBy('u.name');

        if ($status) {
            $query->where('p.status', $status);
        }

        if ($month) {
            $query->where('p.month', $month);
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('u.name', 'like', '%' . $search . '%')
                    ->orWhere('u.code', 'like', '%' . $search . '%');
            });
        }

        $payrolls = $query->get();

        $totalFinalSalary = $payrolls->sum(function ($row) {
            $final = $row->final_salary;
            if ($final === null) {
                $final = ($row->base_salary ?? 0) + ($row->bonus ?? 0) - ($row->penalty ?? 0);
            }
            return (float) $final;
        });

        return view('pos.payroll', [
            'payrolls' => $payrolls,
            'filters' => [
                'month' => $month,
                'status' => $status,
                'q' => $search,
            ],
            'totalFinalSalary' => $totalFinalSalary,
        ]);
    }

    public function generate(Request $request)
    {
        $data = $request->validate([
            'month' => ['required', 'regex:/^\d{4}-\d{2}$/'],
        ], [
            'month.required' => 'Chưa chọn tháng',
        ]);

        $month = $data['month'];
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $staffList = DB::table('users as u')
            ->leftJoin('salary_config as sc', 'sc.staff_id', '=', 'u.id')
            ->select(
                'u.id',
                'u.name',
                'u.code',
                'sc.salary_type',
                'sc.salary_rate'
            )
            ->orderBy('u.name')
            ->get();

        $attendanceSummary = DB::table('attendance')
            ->select(
                'staff_id',
                DB::raw('SUM(work_minutes) as total_minutes'),
                DB::raw('COUNT(DISTINCT work_date) as work_days')
            )
            ->whereBetween('work_date', [$start->toDateString(), $end->toDateString()])
            ->where('attendance_type', 'working')
            ->where('status', 'completed')
            ->groupBy('staff_id')
            ->get()
            ->keyBy('staff_id');

        $shiftSummary = DB::table('work_schedules as ws')
            ->join('attendance as a', function ($join) {
                $join->on('a.staff_id', '=', 'ws.staff_id')
                    ->on('a.work_date', '=', 'ws.work_date');
            })
            ->whereBetween('ws.work_date', [$start->toDateString(), $end->toDateString()])
            ->where('a.attendance_type', 'working')
            ->where('a.status', 'completed')
            ->select(
                'ws.staff_id',
                DB::raw('COUNT(ws.id) as shift_count')
            )
            ->groupBy('ws.staff_id')
            ->get()
            ->keyBy('staff_id');

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $now = now();

        foreach ($staffList as $staff) {
            $salaryType = $staff->salary_type ?? null;
            $salaryRate = is_numeric($staff->salary_rate) ? (float) $staff->salary_rate : 0.0;

            $attendance = $attendanceSummary->get($staff->id);
            $totalMinutes = $attendance ? (int) $attendance->total_minutes : 0;
            $workDays = $attendance ? (int) $attendance->work_days : 0;

            $shiftRow = $shiftSummary->get($staff->id);
            $shiftCount = $shiftRow ? (int) $shiftRow->shift_count : 0;

            $baseSalary = $this->calculateBaseSalary(
                $salaryType,
                $salaryRate,
                $totalMinutes,
                $shiftCount,
                $workDays
            );

            $payrollMinutes = $salaryType === 'hour' ? $totalMinutes : 0;

            $existing = DB::table('payroll')
                ->where('staff_id', $staff->id)
                ->where('month', $month)
                ->first();

            if ($existing && $existing->status === 'paid') {
                $skipped += 1;
                continue;
            }

            $bonus = $existing ? (float) $existing->bonus : 0.0;
            $penalty = $existing ? (float) $existing->penalty : 0.0;
            $finalSalary = $this->roundCurrency($baseSalary + $bonus - $penalty);

            if ($existing) {
                DB::table('payroll')
                    ->where('id', $existing->id)
                    ->update([
                        'total_minutes' => $payrollMinutes,
                        'base_salary' => $baseSalary,
                        'final_salary' => $finalSalary,
                        'updated_at' => $now,
                    ]);
                $updated += 1;
            } else {
                DB::table('payroll')->insert([
                    'staff_id' => $staff->id,
                    'month' => $month,
                    'total_minutes' => $payrollMinutes,
                    'base_salary' => $baseSalary,
                    'bonus' => 0,
                    'penalty' => 0,
                    'final_salary' => $finalSalary,
                    'status' => 'draft',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $created += 1;
            }
        }

        return redirect()->route('pos.payroll', ['month' => $month])
            ->with('success', "Đã tổng hợp bảng lương: tạo {$created}, cập nhật {$updated}, bỏ qua {$skipped} (đã trả)." );
    }

    public function update(Request $request, $id)
    {
        $payroll = DB::table('payroll')->where('id', $id)->first();
        if (!$payroll) {
            abort(404);
        }

        if ($payroll->status === 'paid') {
            return redirect()->back()->with('error', 'Bảng lương đã trả, không thể sửa.');
        }

        $data = $request->validate([
            'bonus' => 'nullable|numeric|min:0',
            'penalty' => 'nullable|numeric|min:0',
            'month' => ['nullable', 'regex:/^\d{4}-\d{2}$/'],
        ]);

        $bonus = array_key_exists('bonus', $data) ? (float) $data['bonus'] : (float) $payroll->bonus;
        $penalty = array_key_exists('penalty', $data) ? (float) $data['penalty'] : (float) $payroll->penalty;
        $baseSalary = (float) $payroll->base_salary;
        $finalSalary = $this->roundCurrency($baseSalary + $bonus - $penalty);

        DB::table('payroll')->where('id', $id)->update([
            'bonus' => $bonus,
            'penalty' => $penalty,
            'final_salary' => $finalSalary,
            'updated_at' => now(),
        ]);

        $redirectMonth = $data['month'] ?? $payroll->month;

        return redirect()->route('pos.payroll', ['month' => $redirectMonth])
            ->with('success', 'Đã cập nhật bảng lương.');
    }

    public function pay(Request $request, $id)
    {
        $payroll = DB::table('payroll')->where('id', $id)->first();
        if (!$payroll) {
            abort(404);
        }

        if ($payroll->status === 'paid') {
            return redirect()->back()->with('error', 'Bảng lương đã trả, không thể sửa.');
        }

        $data = $request->validate([
            'bonus' => 'nullable|numeric|min:0',
            'penalty' => 'nullable|numeric|min:0',
            'month' => ['nullable', 'regex:/^\d{4}-\d{2}$/'],
        ]);

        $bonus = array_key_exists('bonus', $data) ? (float) $data['bonus'] : (float) $payroll->bonus;
        $penalty = array_key_exists('penalty', $data) ? (float) $data['penalty'] : (float) $payroll->penalty;
        $baseSalary = (float) $payroll->base_salary;
        $finalSalary = $this->roundCurrency($baseSalary + $bonus - $penalty);

        DB::table('payroll')->where('id', $id)->update([
            'bonus' => $bonus,
            'penalty' => $penalty,
            'final_salary' => $finalSalary,
            'status' => 'paid',
            'updated_at' => now(),
        ]);

        $redirectMonth = $data['month'] ?? $payroll->month;

        return redirect()->route('pos.payroll', ['month' => $redirectMonth])
            ->with('success', 'Đã chốt và thanh toán bảng lương.');
    }

    private function calculateBaseSalary(
        ?string $type,
        float $rate,
        int $totalMinutes,
        int $shiftCount,
        int $workDays
    ): float {
        $rate = max(0, $rate);

        switch ($type) {
            case 'hour':
                return $this->roundCurrency(($totalMinutes / 60) * $rate);
            case 'shift':
                return $this->roundCurrency($shiftCount * $rate);
            case 'day':
                return $this->roundCurrency($workDays * $rate);
            case 'month':
                return $this->roundCurrency($rate);
            default:
                return 0.0;
        }
    }

    private function roundCurrency(float $value): float
    {
        return round($value, 2);
    }
}
