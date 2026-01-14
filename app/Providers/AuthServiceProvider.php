<?php

namespace App\Providers;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;

// use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot(): void
    {
        Gate::before(function ($user, $ability) {
            return null;
        });
        $permissions = [
            'view_dashboard' => ['Admin', 'Quản Lý', 'Kế Toán', 'Bảo Vệ', 'Bếp Trưởng', 'Bếp Phó', 'Nhân Viên Bàn', 'Nhân viên Phục Vụ', 'Tạp Vụ', 'Chảo', 'Thớt', 'Chảo Non', 'Phụ Bếp'],

            'manage_role' => ['Admin'],

            'view_product' => ['Admin', 'Quản Lý', 'Kế Toán', 'Bếp Trưởng'],
            'create_product' => ['Admin', 'Quản Lý'],
            'update_product' => ['Admin', 'Quản Lý'],
            'delete_product' => ['Admin', 'Quản Lý'],

            'view_ingredient' => ['Admin', 'Quản Lý', 'Kế Toán', 'Bếp Trưởng'],
            'create_ingredient' => ['Admin', 'Quản Lý'],
            'update_ingredient' => ['Admin', 'Quản Lý'],
            'delete_ingredient' => ['Admin', 'Quản Lý'],

            'view_category_product' => ['Admin', 'Quản Lý'],
            'create_category_product' => ['Admin', 'Quản Lý'],
            'update_category_product' => ['Admin', 'Quản Lý'],
            'delete_category_product' => ['Admin', 'Quản Lý'],

            'view_category_ingredient' => ['Admin', 'Quản Lý'],
            'create_category_ingredient' => ['Admin', 'Quản Lý'],
            'update_category_ingredient' => ['Admin', 'Quản Lý'],
            'delete_category_ingredient' => ['Admin', 'Quản Lý'],

            'view_area' => ['Admin', 'Quản Lý'],
            'create_area' => ['Admin', 'Quản Lý'],
            'update_area' => ['Admin', 'Quản Lý'],
            'delete_area' => ['Admin', 'Quản Lý'],

            'view_table' => ['Admin', 'Quản Lý', 'Kế Toán', 'Bếp Trưởng', 'Bếp Phó', 'Bảo Vệ', 'Nhân Viên Bàn', 'Nhân viên Phục Vụ', 'Tạp Vụ', 'Chảo', 'Thớt', 'Chảo Non', 'Phụ Bếp'],
            'create_table' => ['Admin', 'Quản Lý'],
            'update_table' => ['Admin', 'Quản Lý'],
            'update_status_table' => ['Admin', 'Quản Lý'],
            'delete_table' => ['Admin', 'Quản Lý'],

            'view_invoice' => ['Admin', 'Quản Lý', 'Kế Toán', 'Bếp Trưởng', 'Bếp Phó', 'Bảo Vệ', 'Nhân Viên Bàn', 'Nhân viên Phục Vụ', 'Tạp Vụ', 'Chảo', 'Thớt', 'Chảo Non', 'Phụ Bếp'],
            'cancel_invoice' => ['Admin', 'Quản Lý', 'Kế Toán', 'Bếp Trưởng', 'Bếp Phó', 'Bảo Vệ', 'Nhân Viên Bàn', 'Nhân viên Phục Vụ', 'Tạp Vụ', 'Chảo', 'Thớt', 'Chảo Non', 'Phụ Bếp'],

            'view_promotion_type' => ['Admin', 'Quản Lý'],
            'create_promotion_type' => ['Admin', 'Quản Lý'],
            'update_promotion_type' => ['Admin', 'Quản Lý'],
            'delete_promotion_type' => ['Admin', 'Quản Lý'],

            'view_promotion' => ['Admin', 'Quản Lý', 'Kế Toán'],
            'create_promotion' => ['Admin', 'Quản Lý'],
            'update_promotion' => ['Admin', 'Quản Lý'],
            'delete_promotion' => ['Admin', 'Quản Lý'],

            'view_import' => ['Admin', 'Quản Lý', 'Kế Toán', 'Bếp Trưởng', 'Bếp Phó'],
            'create_import' => ['Admin', 'Quản Lý', 'Kế Toán'],
            'delete_import' => ['Admin', 'Quản Lý'],

            'view_export' => ['Admin', 'Quản Lý', 'Kế Toán', 'Bếp Trưởng', 'Bếp Phó'],
            'create_export' => ['Admin', 'Quản Lý', 'Kế Toán'],
            'delete_export' => ['Admin', 'Quản Lý'],

            'view_customer' => ['Admin', 'Nhân viên', 'Kế Toán'],
            'create_customer' => ['Admin', 'Quản Lý'],
            'update_customer' => ['Admin', 'Quản Lý'],

            'view_role' => ['Admin'],
            'create_role' => ['Admin'],
            'update_role' => ['Admin'],
            'delete_role' => ['Admin'],

            'view_staff' => ['Admin', 'Quản Lý', 'Kế Toán'],
            'create_staff' => ['Admin', 'Quản Lý'],
            'update_staff' => ['Admin', 'Quản Lý'],
            'update_status_staff' => ['Admin', 'Quản Lý'],
            'delete_staff' => ['Admin', 'Quản Lý'],

            'manage_shift' => ['Admin', 'Quản Lý'],
            'view_report' => ['Admin', 'Quản Lý', 'Kế Toán'],

            'view_daily_report' => ['Admin', 'Quản Lý', 'Kế Toán'],
            'view_sales_report' => ['Admin', 'Quản Lý', 'Kế Toán'],
            'view_product_report' => ['Admin', 'Quản Lý', 'Kế Toán'],
            'view_staff_report' => ['Admin', 'Quản Lý', 'Kế Toán'],

            'view_analysis' => ['Admin', 'Quản Lý', 'Kế Toán'],

            'view_contact' => ['Admin', 'Quản Lý', 'Kế Toán'],
            'update_contact' => ['Admin', 'Quản Lý'],
        ];

        foreach ($permissions as $permission => $roles) {
            Gate::define($permission, function () use ($roles) {
                $user = Auth::guard('staff')->user();

                if (!$user || !$user->role) {
                    return false;
                }

                return in_array(
                    strtolower($user->role->name),
                    array_map('strtolower', $roles)
                );
            });
        }
    }

    protected $adminPermissions = [
        'view_dashboard',

        'view_product',
        'create_product',
        'update_product',
        'delete_product',

        'view_ingredient',
        'create_ingredient',
        'update_ingredient',
        'delete_ingredient',

        'view_category_product',
        'create_category_product',
        'update_category_product',
        'delete_category_product',

        'view_category_ingredient',
        'create_category_ingredient',
        'update_category_ingredient',
        'delete_category_ingredient',

        'view_area',
        'create_area',
        'update_area',
        'delete_area',

        'view_table',
        'create_table',
        'update_table',
        'update_status_table',
        'delete_table',

        'view_invoice',
        'cancel_invoice',

        'view_promotion_type',
        'create_promotion_type',
        'update_promotion_type',
        'delete_promotion_type',

        'view_promotion',
        'create_promotion',
        'update_promotion',
        'delete_promotion',

        'view_import',
        'create_import',
        'delete_import',

        'view_export',
        'create_export',
        'delete_export',

        'view_customer',
        'update_customer',

        'view_role',
        'create_role',
        'update_role',
        'delete_role',
        'manage_role',

        'view_staff',
        'create_staff',
        'update_staff',
        'update_status_staff',
        'delete_staff',
        'manage_shift',

        'view_report',

        'view_daily_report',
        'view_sales_report',
        'view_product_report',
        'view_staff_report',

        'view_analysis',

        'view_contact',
        'update_contact',
    ];

    protected $staffPermissions = [
        'view_dashboard',

        'view_table',

        'view_invoice',
        'cancel_invoice',

        'view_customer',
    ];
}
