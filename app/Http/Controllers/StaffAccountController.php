<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\Staff;
use Illuminate\Http\Request;

class StaffAccountController extends Controller
{
    public function updateAccount(Request $request)
    {
        /** @var \App\Models\Staff $user */
        $user = Auth::user();

        $request->validate([
            'name' => 'required',
            'phone' => 'required',
            'email' => 'nullable|email',
            'new_password' => 'nullable|min:6',
            'confirm_password' => 'same:new_password',
        ]);

        if ($request->filled('current_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return back()->withErrors(['current_password' => 'Mật khẩu hiện tại không đúng']);
            }
            $user->password = Hash::make($request->new_password);
        }

        $user->name = $request->name;
        $user->phone = $request->phone;
        $user->email = $request->email;

        $user->save();

        Auth::logout();
        return redirect()->route('pos.login')->with('success', 'Cập nhật tài khoản thành công');
    }

}
