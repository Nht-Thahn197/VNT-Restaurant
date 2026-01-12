<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    private function isAdminRole(Role $role): bool
    {
        return strtolower($role->name ?? '') === 'admin';
    }

    private function allPermissionKeys(): array
    {
        $permissions = config('permissions', []);
        $keys = [];

        foreach ($permissions as $items) {
            $keys = array_merge($keys, array_keys($items));
        }

        return $keys;
    }
    public function page()
    {
        $roles = Role::withCount(['tables as staff_count'])
            ->orderBy('name')
            ->get();

        return view('pos.role', compact('roles'));
    }

    public function index()
    {
        return Role::orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50',
        ]);

       // Tạo mới
        $role = Role::create([
            'name' => $request->name
        ]);

        return response()->json([
            'success' => true,
            'role' => $role
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:50'
        ]);

        $role = Role::find($id);

        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $role->name = $request->name;
        $role->save();

        return response()->json(['success' => true, 'message' => 'Cập nhật thành công']);
    }

    public function destroy($id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $role->delete();

        return response()->json(['success' => true, 'message' => 'Xóa thành công']);
    }

    public function editPermissions(Role $role)
    {
        $isAdminRole = $this->isAdminRole($role);
        $allPermissionKeys = $this->allPermissionKeys();

        if ($isAdminRole) {
            $role->permission = $allPermissionKeys;
        }

        return view('pos.permissions', [
            'role' => $role,
            'permissions' => config('permissions'),
            'isAdminRole' => $isAdminRole,
        ]);
    }

    public function updatePermissions(Request $request, Role $role)
    {
        if ($this->isAdminRole($role)) {
            $role->update([
                'permission' => $this->allPermissionKeys(),
            ]);

            return back()->with('success', 'Cập nhật quyền thành công');
        }

        $role->update([
            'permission' => $request->permissions ?? []
        ]);

        return back()->with('success', 'Cập nhật quyền thành công');
    }
}
