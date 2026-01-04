<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Export extends Model
{
    use HasFactory;
    protected $table = 'export';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'code',
        'staff_id',
        'export_time',
        'reason',
        'status',
    ];

    protected $casts = [
        'export_time' => 'datetime',
    ];
    public function staff()
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    public function details()
    {
        return $this->hasMany(ExportDetail::class);
    }
}
