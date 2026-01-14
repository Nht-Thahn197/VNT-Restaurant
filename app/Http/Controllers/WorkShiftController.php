<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WorkShiftController extends Controller
{
    public function index()
    {
        return view('pos.work-shifts');
    }

    public function list()
    {
        $shifts = DB::table('work_shifts')
            ->orderBy('start_time')
            ->get();

        return response()->json(['success' => true, 'shifts' => $shifts]);
    }

    public function store(Request $request)
    {
        $data = $this->validateShift($request);
        if ($data instanceof \Illuminate\Http\JsonResponse) {
            return $data;
        }

        $id = DB::table('work_shifts')->insertGetId([
            'name' => $data['name'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'break_minutes' => $data['break_minutes'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true, 'id' => $id]);
    }

    public function update(Request $request, $id)
    {
        $data = $this->validateShift($request);
        if ($data instanceof \Illuminate\Http\JsonResponse) {
            return $data;
        }

        DB::table('work_shifts')
            ->where('id', $id)
            ->update([
                'name' => $data['name'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'break_minutes' => $data['break_minutes'],
                'updated_at' => now(),
            ]);

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        DB::table('work_shifts')
            ->where('id', $id)
            ->delete();

        return response()->json(['success' => true]);
    }

    private function validateShift(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50',
            'start_time' => ['required', 'regex:/^\\d{2}:\\d{2}(:\\d{2})?$/'],
            'end_time' => ['required', 'regex:/^\\d{2}:\\d{2}(:\\d{2})?$/'],
            'break_minutes' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $data['break_minutes'] = $data['break_minutes'] ?? 0;
        $data['start_time'] = $this->normalizeTime($data['start_time']);
        $data['end_time'] = $this->normalizeTime($data['end_time']);

        return $data;
    }

    private function normalizeTime(string $time): string
    {
        if (strlen($time) === 5) {
            return $time . ':00';
        }
        return $time;
    }
}
