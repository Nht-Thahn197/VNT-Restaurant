<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Import extends Model
{
    use HasFactory;

    protected $table = 'import';
    protected $primaryKey = 'id';

    protected $fillable = [
        'code',
        'staff_id',
        'import_time',
        'total_price',
        'status',
    ];

    protected $casts = [
        'import_time' => 'datetime',
    ];
    public function staff()
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    public function details()
    {
        return $this->hasMany(ImportDetail::class);
    }
}
