<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    protected $table = 'payroll';

    protected $fillable = [
        'staff_id',
        'month',
        'total_minutes',
        'base_salary',
        'bonus',
        'penalty',
        'final_salary',
        'status',
    ];

    protected $casts = [
        'total_minutes' => 'integer',
        'base_salary' => 'decimal:2',
        'bonus' => 'decimal:2',
        'penalty' => 'decimal:2',
        'final_salary' => 'decimal:2',
    ];
}
