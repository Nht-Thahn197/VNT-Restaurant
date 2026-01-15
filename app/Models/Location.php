<?php

namespace App\Models;

use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $table = 'location';
    public $timestamps = false;

    protected $fillable = [
        'region_id',
        'code',
        'thumbnail',
        'status',
        'name',
        'capacity',
        'area',
        'floors',
        'time_start',
        'time_end',
        'created_at',
    ];

    public function region()
    {
        return $this->belongsTo(Region::class, 'region_id', 'id');
    }
}
