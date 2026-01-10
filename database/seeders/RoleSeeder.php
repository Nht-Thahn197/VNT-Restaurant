<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'permission' => [
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

                    'view_table',
                    'create_table',
                    'update_table',
                    'delete_table',

                    'view_invoice',
                    'cancel_invoice',

                    'view_promotion',
                    'view_import',
                    'view_export',

                    'view_customer',
                    'update_customer',

                    'view_staff',

                    'view_report',
                    'view_analysis',
                    'view_contact',
                ],
            ],
            [
                'name' => 'Quản Lý',
                'permission' => [
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

                    'view_table',
                    'create_table',
                    'update_table',
                    'delete_table',

                    'view_invoice',
                    'cancel_invoice',

                    'view_promotion',
                    'view_import',
                    'view_export',

                    'update_customer',

                    'view_staff',

                    'view_report',
                    'view_analysis',
                    'view_contact',
                ],
            ],
            [
                'name' => 'Kế Toán',
                'permission' => [
                    'view_dashboard',

                    'view_product',
                    'view_ingredient',

                    'view_table',

                    'view_invoice',
                    'cancel_invoice',

                    'view_promotion',
                    'view_import',
                    'view_export',

                    'view_customer',

                    'view_staff',

                    'view_report',
                    'view_analysis',
                    'view_contact',
                ],
            ],
            [
                'name' => 'Bảo Vệ',
                'permission' => [
                    'view_dashboard',
                    'view_table',
                    'view_invoice',
                    'cancel_invoice',
                ],
            ],
            [
                'name' => 'Bếp Trưởng',
                'permission' => [
                    'view_dashboard',
                    'view_product',
                    'view_ingredient',
                    'view_table',
                    'view_invoice',
                    'cancel_invoice',
                    'view_import',
                    'view_export',
                ],
            ],
            [
                'name' => 'Bếp Phó',
                'permission' => [
                    'view_dashboard',
                    'view_table',
                    'view_invoice',
                    'cancel_invoice',
                    'view_import',
                    'view_export',
                ],
            ],
            [
                'name' => 'Nhân Viên Bàn',
                'permission' => [
                    'view_dashboard',
                    'view_table',
                    'view_invoice',
                    'cancel_invoice',
                ],
            ],
            [
                'name' => 'Nhân viên Phục Vụ',
                'permission' => [
                    'view_dashboard',
                    'view_table',
                    'view_invoice',
                    'cancel_invoice',
                ],
            ],
            [
                'name' => 'Tạp Vụ',
                'permission' => [
                    'view_dashboard',
                    'view_table',
                    'view_invoice',
                    'cancel_invoice',
                ],
            ],
            [
                'name' => 'Chảo',
                'permission' => [
                    'view_dashboard',
                    'view_table',
                    'view_invoice',
                    'cancel_invoice',
                ],
            ],
            [
                'name' => 'Thớt',
                'permission' => [
                    'view_dashboard',
                    'view_table',
                    'view_invoice',
                    'cancel_invoice',
                ],
            ],
            [
                'name' => 'Chảo Non',
                'permission' => [
                    'view_dashboard',
                    'view_table',
                    'view_invoice',
                    'cancel_invoice',
                ],
            ],
            [
                'name' => 'Phụ Bếp',
                'permission' => [
                    'view_dashboard',
                    'view_table',
                    'view_invoice',
                    'cancel_invoice',
                ],
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                ['permission' => $role['permission']]
            );
        }
    }
}
