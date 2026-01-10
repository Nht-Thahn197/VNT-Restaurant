<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class StaffController extends Controller
{
    public function index()
    {
        $roles = Role::orderBy('name')->get();
        $staff = Staff::with('role')->orderBy('id', 'desc')->get();

        return view('pos.staff', compact('staff', 'roles'));
    }

    public function show($id)
    {
        $staff = Staff::with('role')->findOrFail($id);
        return response()->json(['success' => true, 'staff' => $staff]);
    }


    public function store(Request $request)
    {
        $data = $request->only([
            'name','phone','cccd','email','password','dob','gender','role_id','start_date'
        ]);

        $data['status'] = 'Active'; // mặc định thêm mới là active

        // Xử lý ảnh
        if ($request->hasFile('img')) {
            $file = $request->file('img');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('images/staff'), $filename);
            $data['img'] = $filename;
        }

        // Hash password nếu có
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $staff = Staff::create($data);

        return response()->json(['success' => true, 'staff' => $staff]);
    }

    public function update(Request $request, $id)
    {
        $staff = Staff::findOrFail($id);

        $data = $request->only([
            'name','phone','cccd','email','password','dob','gender','role_id','start_date'
        ]);

        // Xử lý ảnh
        if ($request->hasFile('img')) {
            $file = $request->file('img');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('images/staff'), $filename);
            $data['img'] = $filename;
        }

        // Hash password nếu có
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']); // giữ password cũ nếu không nhập
        }

        $staff->update($data);

        return response()->json(['success' => true, 'staff' => $staff]);
    }

    public function updateAccount(Request $request)
    {
        /** @var Staff|null $user */
        $user = Auth::guard('staff')->user();
        if (!$user) {
            return response()->json(['errors' => ['auth' => ['Chưa đăng nhập.']]], 401);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'phone' => 'required',
            'email' => 'nullable|email',
            'current_password' => 'required',
            'new_password' => 'nullable|min:8|confirmed',
        ], [
            'name.required' => 'Tên không được bỏ trống.',
            'phone.required' => 'SĐT không được bỏ trống.',
            'email.email' => 'Email không đúng định dạng.',
            'current_password.required' => 'Nhập mật khẩu hiện tại.',
            'new_password.min' => 'Mật khẩu mới phải tối thiểu 8 ký tự.',
            'new_password.confirmed' => 'Xác nhận mật khẩu mới không khớp.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Kiểm tra mật khẩu hiện tại
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['errors' => ['current_password' => ['Mật khẩu hiện tại không đúng!']]], 422);
        }

        // Cập nhật thông tin
        $user->name = $request->name;
        $user->phone = $request->phone;
        $user->email = $request->email;

        if ($request->filled('new_password')) {
            $user->password = Hash::make($request->new_password);
        }

        $user->save();

        return response()->json(['success' => 'Cập nhật tài khoản thành công!']);
    }

    public function updateStatus(Request $request, $id)
    {
        $staff = Staff::findOrFail($id);
        $newStatus = $request->status ?? ($staff->status === 'Active' ? 'Inactive' : 'Active');
        $staff->status = $newStatus;
        $staff->save();

        return response()->json(['success' => true, 'status' => $staff->status]);
    }

    public function destroy($id)
    {
        $staff = Staff::findOrFail($id);
        $staff->delete();

        return response()->json(['success' => true]);
    }
    
}
