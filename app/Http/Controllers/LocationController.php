<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Region;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index()
    {
        $regions = Region::orderBy('name')->get();
        $locations = Location::with('region')->orderBy('id')->get();

        return view('pos.location', compact('regions', 'locations'));
    }

    public function show($id)
    {
        $location = Location::with('region')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $location
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);
        $location = Location::create($data);

        return response()->json([
            'success' => true,
            'data'    => $location
        ]);
    }

    public function update(Request $request, $id)
    {
        $data = $this->validatePayload($request);
        $location = Location::findOrFail($id);
        $location->update($data);

        return response()->json(['success' => true]);
    }

    public function toggleStatus($id)
    {
        $location = Location::findOrFail($id);
        $location->status = $location->status === 'active' ? 'inactive' : 'active';
        $location->save();

        return response()->json([
            'success' => true,
            'status'  => $location->status
        ]);
    }

    public function destroy($id)
    {
        $location = Location::findOrFail($id);
        $location->delete();

        return response()->json(['success' => true]);
    }

    protected function validatePayload(Request $request): array
    {
        $request->merge([
            'time_start' => $this->normalizeTimeValue($request->input('time_start')),
            'time_end' => $this->normalizeTimeValue($request->input('time_end')),
        ]);

        $rules = [
            'region_id' => 'required|exists:regions,id',
            'code'      => 'required|string|max:150',
            'name'      => 'required|string|max:150',
            'capacity'  => 'nullable|integer|min:0',
            'area'      => 'nullable|numeric|min:0',
            'floors'    => 'nullable|integer|min:0',
            'time_start'=> 'nullable|date_format:H:i',
            'time_end'  => 'nullable|date_format:H:i',
            'map_url'   => 'nullable|string|max:500',
            'status'    => 'required|in:active,inactive',
        ];

        if ($request->hasFile('thumbnail')) {
            $rules['thumbnail'] = 'nullable|image|max:2048';
        } else {
            $rules['thumbnail'] = 'nullable|string|max:255';
        }

        $data = $request->validate($rules);

        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('images/location'), $filename);
            $data['thumbnail'] = 'images/location/' . $filename;
        } elseif (array_key_exists('thumbnail', $data) && $data['thumbnail'] === '') {
            $data['thumbnail'] = null;
        }

        if (array_key_exists('map_url', $data) && $data['map_url'] === '') {
            $data['map_url'] = null;
        }

        return $data;
    }

    protected function normalizeTimeValue(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        if (preg_match('/^(\d{1,2}):(\d{2})/', $value, $matches)) {
            return str_pad($matches[1], 2, '0', STR_PAD_LEFT) . ':' . $matches[2];
        }

        return $value;
    }
}
