<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index()
    {
        $user = Auth::guard('staff')->user();
        $canManage = Gate::allows('manage_shift');

        return view('pos.attendance', [
            'canManageAttendance' => $canManage,
            'staffId' => $user ? $user->id : null,
        ]);
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

        $schedules = DB::table('work_schedules as ws')
            ->join('users as u', 'u.id', '=', 'ws.staff_id')
            ->join('work_shifts as sh', 'sh.id', '=', 'ws.shift_id')
            ->leftJoin('attendance as a', function ($join) {
                $join->on('a.staff_id', '=', 'ws.staff_id')
                    ->on('a.work_date', '=', 'ws.work_date');
            })
            ->whereBetween('ws.work_date', [$start->toDateString(), $end->toDateString()])
            ->select(
                'ws.id',
                'ws.staff_id',
                'ws.shift_id',
                'ws.work_date',
                'u.name as staff_name',
                'u.code as staff_code',
                'sh.name as shift_name',
                'sh.start_time',
                'sh.end_time',
                'a.check_in',
                'a.check_out',
                'a.attendance_type',
                'a.status as attendance_status',
                'a.note'
            )
            ->orderBy('sh.start_time')
            ->orderBy('ws.work_date')
            ->orderBy('u.name')
            ->get();

        return response()->json([
            'success' => true,
            'weekStart' => $start->toDateString(),
            'weekEnd' => $end->toDateString(),
            'shifts' => $shifts,
            'schedules' => $schedules,
        ]);
    }

    public function update(Request $request)
    {
        if (!Gate::allows('manage_shift')) {
            return response()->json(['success' => false, 'message' => 'Khong co quyen.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'staff_id' => 'required|integer',
            'work_date' => 'required|date',
            'shift_id' => 'required|integer',
            'new_shift_id' => 'nullable|integer',
            'attendance_type' => 'required|in:working,leave_paid,leave_unpaid,off',
            'status' => 'required|in:pending,completed',
            'note' => 'nullable|string|max:255',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $workDate = Carbon::parse($data['work_date']);

        $attendance = DB::table('attendance')
            ->where('staff_id', $data['staff_id'])
            ->where('work_date', $workDate->toDateString())
            ->first();

        if (!empty($data['new_shift_id']) && $data['new_shift_id'] !== $data['shift_id']) {
            if ($attendance && ($attendance->check_in || $attendance->check_out)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Khong the doi ca khi da cham cong.',
                ], 422);
            }

            DB::table('work_schedules')
                ->where('staff_id', $data['staff_id'])
                ->where('shift_id', $data['shift_id'])
                ->where('work_date', $workDate->toDateString())
                ->update([
                    'shift_id' => $data['new_shift_id'],
                    'updated_at' => now(),
                ]);
        }

        $attendanceType = $data['attendance_type'];
        $checkIn = $this->combineDateTime($workDate, $data['check_in'] ?? null);
        $checkOut = $this->combineDateTime($workDate, $data['check_out'] ?? null);
        $workMinutes = $this->calculateMinutes($checkIn, $checkOut);
        $note = $data['note'] ?? null;

        if ($attendanceType !== 'working') {
            $checkIn = null;
            $checkOut = null;
            $workMinutes = 0;
            $data['status'] = 'completed';
        }

        if ($attendance) {
            DB::table('attendance')
                ->where('id', $attendance->id)
                ->update([
                    'check_in' => $checkIn,
                    'check_out' => $checkOut,
                    'work_minutes' => $workMinutes,
                    'attendance_type' => $attendanceType,
                    'status' => $data['status'],
                    'note' => $note,
                    'updated_at' => now(),
                ]);
        } else {
            DB::table('attendance')->insert([
                'staff_id' => $data['staff_id'],
                'work_date' => $workDate->toDateString(),
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'work_minutes' => $workMinutes,
                'attendance_type' => $attendanceType,
                'status' => $data['status'],
                'note' => $note,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function clock(Request $request)
    {
        $user = Auth::guard('staff')->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Chua dang nhap.'], 401);
        }

        $validator = Validator::make($request->all(), [
            'work_date' => 'required|date',
            'shift_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $workDate = Carbon::parse($data['work_date']);
        $now = Carbon::now();

        $schedule = DB::table('work_schedules')
            ->where('staff_id', $user->id)
            ->where('shift_id', $data['shift_id'])
            ->where('work_date', $workDate->toDateString())
            ->first();

        if (!$schedule) {
            return response()->json(['success' => false, 'message' => 'Khong co lich lam viec.'], 422);
        }

        $shift = DB::table('work_shifts')->where('id', $data['shift_id'])->first();
        if ($shift) {
            $shiftStartAt = Carbon::parse($workDate->toDateString() . ' ' . $shift->start_time);
            if ($now->lt($shiftStartAt->copy()->subMinutes(30))) {
                return response()->json(['success' => false, 'message' => 'Chua den ca.'], 422);
            }
        }

        $attendance = DB::table('attendance')
            ->where('staff_id', $user->id)
            ->where('work_date', $workDate->toDateString())
            ->first();

        if (!$attendance) {
            DB::table('attendance')->insert([
                'staff_id' => $user->id,
                'work_date' => $workDate->toDateString(),
                'check_in' => $now,
                'check_out' => null,
                'work_minutes' => 0,
                'attendance_type' => 'working',
                'status' => 'pending',
                'note' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return response()->json(['success' => true, 'action' => 'check_in', 'time' => $now->toDateTimeString()]);
        }

        if (in_array($attendance->attendance_type, ['leave_paid', 'leave_unpaid', 'off'], true)) {
            return response()->json(['success' => false, 'message' => 'Khong the cham cong vi da nghi.'], 422);
        }

        if (!$attendance->check_in) {
            DB::table('attendance')
                ->where('id', $attendance->id)
                ->update([
                    'check_in' => $now,
                    'check_out' => null,
                    'work_minutes' => 0,
                    'attendance_type' => 'working',
                    'status' => 'pending',
                    'updated_at' => now(),
                ]);

            return response()->json(['success' => true, 'action' => 'check_in', 'time' => $now->toDateTimeString()]);
        }

        if ($attendance->check_in && !$attendance->check_out) {
            $minutes = $now->diffInMinutes(Carbon::parse($attendance->check_in));
            DB::table('attendance')
                ->where('id', $attendance->id)
                ->update([
                    'check_out' => $now,
                    'work_minutes' => $minutes,
                    'status' => 'completed',
                    'updated_at' => now(),
                ]);

            return response()->json(['success' => true, 'action' => 'check_out', 'time' => $now->toDateTimeString()]);
        }

        return response()->json(['success' => false, 'message' => 'Da cham cong.'], 422);
    }

    private function combineDateTime(Carbon $date, ?string $time): ?string
    {
        if (!$time) {
            return null;
        }
        return Carbon::parse($date->toDateString() . ' ' . $time . ':00')->toDateTimeString();
    }

    private function calculateMinutes(?string $checkIn, ?string $checkOut): int
    {
        if (!$checkIn || !$checkOut) {
            return 0;
        }
        return Carbon::parse($checkIn)->diffInMinutes(Carbon::parse($checkOut));
    }
}
