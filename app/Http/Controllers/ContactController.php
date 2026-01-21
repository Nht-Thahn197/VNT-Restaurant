<?php

namespace App\Http\Controllers;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index()
    {
        $contacts = Contact::orderBy('id', 'desc')->get();
        return view('pos.contact', compact('contacts'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'required|email|max:100',
            'subject' => 'required|string|max:150',
            'message' => 'required',
            'type'    => 'required|in:complaint,media',
        ]);

        Contact::create([
            'type'    => $request->type,
            'name'    => $request->name,
            'phone'   => $request->phone,
            'email'   => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
            'status'  => 'pending',
        ]);

        return back()->with('success', 'Cảm ơn bạn! Thông tin đã được gửi thành công.');
    }

    public function updateStatus($id)
    {
        try {
            $contact = Contact::findOrFail($id);
            $contact->status = 'processed';
            $contact->save();

            return response()->json([
                'success' => true,
                'message' => 'Đã cập nhật trạng thái thành công!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
}
