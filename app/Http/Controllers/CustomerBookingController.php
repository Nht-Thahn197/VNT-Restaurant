<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Promotion;
use Illuminate\Http\Request;

class CustomerBookingController extends Controller
{
    public function index(Request $request)
    {
        $locations = DB::table('location')
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        $promotions = DB::table('promotion')
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        $selectedLocation = null;
        if ($request->has('location_id')) {
            $selectedLocation = $locations->where('id', $request->location_id)->first();
        }

        return view('customer.booking', compact('locations', 'promotions', 'selectedLocation'));
    }

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $customer = DB::table('customer')->where('phone', $request->phone)->first();
            if (!$customer) {
                $customerId = DB::table('customer')->insertGetId([
                    'name' => $request->customer_name,
                    'phone' => $request->phone,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $customerId = $customer->id;
            }
            $bookingId = DB::table('booking')->insertGetId([
                'customer_id'   => $customerId,
                'customer_name' => $request->customer_name,
                'phone'         => $request->phone,
                'location_id'   => $request->location_id,
                'guest_count'   => $request->guest_count,
                'booking_time'  => $request->booking_time,
                'promotion_id'  => $request->promotion_id,
                'note'          => $request->note,
                'status'        => 'waiting',
                'created_at'    => now()
            ]);
            if ($request->has('items') && is_array($request->items)) {
                foreach ($request->items as $item) {
                    DB::table('booking_item')->insert([
                        'booking_id'   => $bookingId,
                        'product_id'   => $item['id'],
                        'product_name' => $item['name'],
                        'qty'          => $item['quantity'],
                        'price'        => $item['price'],
                        'note'         => null
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đặt bàn và món ăn thành công!'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }
}
