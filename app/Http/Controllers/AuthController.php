<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Staff;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('pos.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required',
            'password' => 'required'
        ]);

        $credentials = [
            'phone' => $request->phone,
            'password' => $request->password,
        ];

        if (Auth::guard('staff')->attempt($credentials)) {
            $request->session()->regenerate();
            if ($request->action === 'manage') {
                return redirect()->route('pos.kiot');     // trang quản lý
            }   
            if ($request->action === 'cashier') {
                return redirect()->route('pos.cashier');  // trang bán hàng
            }

            return redirect()->route('pos.kiot');
        }

        return back()->withErrors([
            'login' => 'Sai số điện thoại hoặc mật khẩu!'
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('staff')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
