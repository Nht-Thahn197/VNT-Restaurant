<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class WorkScheduleController extends Controller
{
    public function index()
    {
        return view('pos.work-schedule');
    }

    public function data()
    {
        $weekStartInput = request('weekStart');
        $start = $weekStartInput
            ? Carbon::parse($weekStartInput)->startOfDay()
            : Carbon::today()->startOfWeek(Carbon::MONDAY);

        $end = $start->copy()->addDays(6)->endOfDay();

        $shifts = DB::table('work_shifts')
            ->orderBy('start_time')
            ->get();

        $staff = DB::table('users as u')
            ->leftJoin('salary_config as sc', 'sc.staff_id', '=', 'u.id')
            ->select(
                'u.id',
                'u.name',
                'u.code',
                'sc.salary_type',
                'sc.salary_rate'
            )
            ->orderBy('name')
            ->get();

        $schedules = DB::table('work_schedules')
            ->whereBetween('work_date', [$start->toDateString(), $end->toDateString()])
            ->get();

        return response()->json([
            'success' => true,
            'weekStart' => $start->toDateString(),
            'weekEnd' => $end->toDateString(),
            'shifts' => $shifts,
            'staff' => $staff,
            'schedules' => $schedules,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mode' => 'required|in:shift,staff',
            'date' => 'required|date',
            'shift_id' => 'nullable|integer',
            'staff_id' => 'nullable|integer',
            'staff_ids' => 'array',
            'staff_ids.*' => 'integer',
            'shift_ids' => 'array',
            'shift_ids.*' => 'integer',
            'repeat_weekly' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();
            $mode = $data['mode'];
            $date = Carbon::parse($data['date']);
            $repeat = !empty($data['repeat_weekly']);
            $dates = $this->buildDates($date, $repeat);

            if ($mode === 'shift') {
                $shiftId = $data['shift_id'] ?? null;
                $staffIds = $data['staff_ids'] ?? [];
                if (!$shiftId || empty($staffIds)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vui lòng chọn ca và nhân viên.',
                    ], 422);
                }
                $this->upsertSchedules($shiftId, $staffIds, $dates);
            } else {
                $staffId = $data['staff_id'] ?? null;
                $shiftIds = $data['shift_ids'] ?? [];
                if (!$staffId || empty($shiftIds)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vui lòng chọn nhân viên và ca làm việc.',
                    ], 422);
                }
                $this->upsertSchedulesForStaff($staffId, $shiftIds, $dates);
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'staff_id' => 'required|integer',
            'shift_id' => 'required|integer',
            'work_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        DB::table('work_schedules')
            ->where('staff_id', $data['staff_id'])
            ->where('shift_id', $data['shift_id'])
            ->where('work_date', $data['work_date'])
            ->delete();

        return response()->json(['success' => true]);
    }

    private function buildDates(Carbon $date, bool $repeat): array
    {
        $dates = [$date->copy()->toDateString()];
        if ($repeat) {
            for ($i = 1; $i <= 3; $i += 1) {
                $dates[] = $date->copy()->addWeeks($i)->toDateString();
            }
        }
        return $dates;
    }

    private function upsertSchedules(int $shiftId, array $staffIds, array $dates): void
    {
        foreach ($staffIds as $staffId) {
            foreach ($dates as $workDate) {
                DB::table('work_schedules')->updateOrInsert(
                    [
                        'staff_id' => $staffId,
                        'shift_id' => $shiftId,
                        'work_date' => $workDate,
                    ],
                    [
                        'note' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }

    private function upsertSchedulesForStaff(int $staffId, array $shiftIds, array $dates): void
    {
        foreach ($shiftIds as $shiftId) {
            foreach ($dates as $workDate) {
                DB::table('work_schedules')->updateOrInsert(
                    [
                        'staff_id' => $staffId,
                        'shift_id' => $shiftId,
                        'work_date' => $workDate,
                    ],
                    [
                        'note' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
