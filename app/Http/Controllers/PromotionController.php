<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Promotion;
use App\Models\PromotionType;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    public function index() 
    { 
        $promotions = Promotion::with(['location', 'type'])->get(); 
        $types = PromotionType::all();
        $locations = Location::all();
        return view('pos.promotion', compact('promotions', 'types', 'locations'));
    }

    public function show($id) 
    { 
        $promotion = Promotion::with(['location', 'type'])->findOrFail($id); 
        $types = PromotionType::all();
        $locations = Location::all();
        return view('pos.promotion_show', compact('promotion', 'types', 'locations'));
    }

    public function store(Request $request)
    {
        $data = $this->validatePayload($request);
        $promotion = Promotion::create($data);

        return response()->json([ 
            'success' => true, 
            'message' => 'Thêm khuyến mãi thành công', 
            'data' => $promotion 
        ]);
    }


    public function update(Request $request, $id) 
    { 
        $data = $this->validatePayload($request);
        $promotion = Promotion::findOrFail($id);
        $promotion->update($data);

        return response()->json([ 
            'success' => true, 
            'message' => 'Cập nhật khuyến mãi thành công', 
            'data' => $promotion 
        ]);
    }

    public function destroy($id)
    { 
        $promotion = Promotion::findOrFail($id); 
        $promotion->delete(); 
        return response()->json([ 
            'success' => true, 
            'message' => 'Xóa khuyến mãi thành công' 
        ]); 
    }

    public function available(Request $request)
    {
        $query = DB::table('promotion')
            ->join('promotion_type', 'promotion.type_id', '=', 'promotion_type.id')
            ->where('promotion.start_date', '<=', now())
            ->where(function ($q) {
                $q->where('promotion.end_date', '>=', now())
                ->orWhereNull('promotion.end_date');
            });

        if ($request->location_id) {
            $query->where('promotion.location_id', $request->location_id);
        }

        $promotions = $query->select(
            'promotion.id',
            'promotion.name',
            'promotion.discount',
            'promotion.description',
            'promotion_type.code as type'
        )->orderBy('promotion.start_date', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $promotions
        ]);
    }

    protected function validatePayload(Request $request): array
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'type_id' => 'required|exists:promotion_type,id',
            'location_id' => 'required|exists:location,id',
            'discount' => 'nullable|numeric',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'images' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('images')) {
            $file = $request->file('images');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('images/news'), $filename);
            $data['images'] = 'images/news/' . $filename;
        } else {
            unset($data['images']);
        }

        return $data;
    }
}
