<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $table = 'location';

    protected $fillable = [
        'code',
        'status',
        'name',
        'capacity',
        'area',
        'floors',
        'time_start',
        'time_end',
        'create_at'
    ];
}
