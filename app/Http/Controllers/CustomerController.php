<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    public function index()
    {
        $customer = Customer::orderBy('id', 'desc')->get();
        return view('pos.customer', compact('customer'));
    }

    public function show($id)
    {
        $customer = Customer::findOrFail($id);

        return response()->json([
            'success'  => true,
            'customer' => $customer
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required',
            'phone' => 'required',
        ]);

        DB::transaction(function () use ($request) {
            Customer::create([
                'name'   => $request->name,
                'phone'  => $request->phone,
                'email'  => $request->email ?: null,
                'gender' => $request->gender ?: null,
                'dob'    => $request->dob ? date('Y-m-d', strtotime($request->dob)) : null,
            ]);
        });

        return response()->json(['success' => true]);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:150',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:150',
            'gender'=> 'nullable|in:nam,nữ,khác',
            'dob'   => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $customer->update([
            'name'   => $request->name,
            'phone'  => $request->phone,
            'email'  => $request->email,
            'gender' => $request->gender,
            'dob'    => $request->dob,
        ]);

        return response()->json([
            'success'  => true,
            'customer' => $customer
        ]);
    }

    public function findByPhone(Request $request)
    {
        $phone = $request->query('phone');
        if (!$phone) {
            return response()->json(['found' => false]);
        }

        $customer = Customer::where('phone', $phone)->first();
        if ($customer) {
            return response()->json([
                'found' => true,
                'customer' => [
                    'id'   => $customer->id,
                    'name' => $customer->name,
                    'phone'=> $customer->phone,
                ]
            ]);
        }

        return response()->json(['found' => false]);
    }

    public function checkByPhone(Request $request)
    {
        $phone = $request->phone;
        if (!$phone) {
            return response()->json(['exists' => false]);
        }

        $customer = Customer::where('phone', $phone)->first();
        if ($customer) {
            return response()->json([
                'exists' => true,
                'customer' => [
                    'id'   => $customer->id,
                    'name' => $customer->name,
                ]
            ]);
        }

        return response()->json(['exists' => false]);
    }
}
