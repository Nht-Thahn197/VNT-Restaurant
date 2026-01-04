<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Customer;
use App\Models\Area;
use App\Models\Table;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::with('table')->orderBy('booking_time', 'desc')->get();
        $areas  = Area::orderBy('name')->get();
        $tables = Table::orderBy('name')->get();

        return view('pos.booking', compact('bookings', 'areas', 'tables'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'phone'         => 'required',
            'promotion_id'  => 'nullable|exists:promotion,id',
            'booking_time'  => 'nullable|date',
            'guest_count'   => 'nullable|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            // ===== 1. XÁC ĐỊNH CUSTOMER =====
            if ($request->customer_id) {
                // khách cũ
                $customer = Customer::find($request->customer_id);

                if (!$customer) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Khách không tồn tại'
                    ], 400);
                }
            } else {
                // kiểm tra theo phone
                $customer = Customer::where('phone', $request->phone)->first();

                if (!$customer) {
                    // khách mới → bắt buộc phải có tên
                    if (!$request->customer_name) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Vui lòng nhập tên khách hàng mới'
                        ], 422);
                    }

                    $customer = Customer::create([
                        'name'  => $request->customer_name,
                        'phone' => $request->phone,
                    ]);
                }
            }

            $customerId = $customer->id;
            $customerName = $customer->name;

            // ===== 2. TẠO BOOKING =====
            $booking = Booking::create([
                'customer_id'   => $customerId,
                'customer_name' => $customerName,
                'phone'         => $request->phone,
                'promotion_id'  => $request->promotion_id,
                'booking_time'  => $request->booking_time,
                'guest_count'   => $request->guest_count ?? 1,
                'area_id'       => $request->area_id,
                'table_id'      => $request->table_id,
                'status'        => 'waiting',
                'note'          => $request->note,
                'created_by'    => Auth::guard('staff')->id()
            ]);

            // ===== 3. LƯU MÓN ĐẶT TRƯỚC =====
            if ($request->filled('preorder_items')) {
                $items = json_decode($request->preorder_items, true);

                foreach ($items as $item) {
                    BookingItem::create([
                        'booking_id'   => $booking->id,
                        'product_id'   => $item['product_id'],
                        'product_name' => $item['product_name'],
                        'qty'          => $item['qty'],
                        'price'        => $item['price'],
                        'note'         => $item['note'] ?? null
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'booking' => $booking
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }


    public function show($id)
    {
        try {
            $booking = Booking::with(['items', 'table', 'promotion'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'booking' => [
                    'id' => $booking->id,
                    'customer_id' => $booking->customer_id,
                    'customer_name' => $booking->customer_name,
                    'phone' => $booking->phone,
                    'promotion_id' => $booking->promotion_id,
                    'promotion_name' => $booking->promotion->name ?? null,
                    'booking_time' => $booking->booking_time,
                    'guest_count' => $booking->guest_count,
                    'table_id' => $booking->table_id,
                    'table_name' => $booking->table->name ?? null,
                    'note' => $booking->note,
                    'status' => $booking->status,
                    'items' => $booking->items
                ]
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->status === 'received') {
            return response()->json([
                'success' => false,
                'message' => 'Bàn đã nhận, không thể sửa'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $status = $booking->status;

            // nếu chọn bàn → assigned
            if ($request->table_id && $booking->status === 'waiting') {
                $status = 'assigned';
            }

            $booking->update([
                'booking_time' => $request->booking_time,
                'guest_count'  => $request->guest_count,
                'table_id'     => $request->table_id,
                'promotion_id' => $request->promotion_id,
                'note'         => $request->note,
                'status'       => $status
            ]);

            // ===== UPDATE BOOKING ITEM =====
            BookingItem::where('booking_id', $booking->id)->delete();

            if ($request->filled('preorder_items')) {
                foreach (json_decode($request->preorder_items, true) as $item) {
                    BookingItem::create([
                        'booking_id'   => $booking->id,
                        'product_id'   => $item['product_id'],
                        'product_name' => $item['product_name'],
                        'qty'          => $item['qty'],
                        'price'        => $item['price'],
                        'note'         => $item['note'] ?? null,
                    ]);
                }
            }

            DB::commit();

            $booking->load('promotion');

            return response()->json([
                'success' => true,
                'promotion_id' => $booking->promotion_id,
                'promotion_name' => $booking->promotion->name ?? null
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['success' => false], 500);
        }
    }

    public function receive($id)
    {
        DB::beginTransaction();
        try {
            $booking = Booking::findOrFail($id);
            $booking->status = 'received';
            $booking->save();

            DB::commit(); // Phải commit trước khi return

            return response()->json([
                'success' => true,
                'redirect' => route('pos.cashier', [
                    'table_id' => $booking->table_id,
                    'booking_id' => $booking->id
                ])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getBookingItems($id)
    {
        try {
            // Sử dụng tên bảng chính xác như bạn đã cung cấp: booking_item và product
            $items = DB::table('booking_item')
                ->join('product', 'booking_item.product_id', '=', 'product.id')
                ->where('booking_item.booking_id', $id)
                ->select(
                    'product.id as product_id', 
                    'product.name as product_name', 
                    'booking_item.qty', 
                    'product.price', 
                    'product.unit'
                )
                ->get();

            return response()->json([
                'success' => true,
                'items' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Lỗi truy vấn: " . $e->getMessage()
            ], 500);
        }
    }

    public function cancel($id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->status === 'received') {
            return response()->json([
                'success' => false,
                'message' => 'Khách đã nhận bàn, không thể hủy'
            ], 400);
        }

        $booking->update(['status' => 'cancel']);

        return response()->json([
            'success' => true
        ]);
    }

}
