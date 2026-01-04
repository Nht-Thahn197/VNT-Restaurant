<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Table extends Model
{
    protected $table = 'dining_table';

    protected $fillable = [
        'name',
        'area_id',
        'status',
    ];

    public $timestamps = false;
    
    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function currentInvoice()
    {
        return $this->hasOne(Invoice::class, 'table_id')
        ->whereNull('paid_at');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'table_id', 'id');
    }

    public function getUsingAttribute()
    {
        return $this->invoices()->where('status', 'serving')->exists();
    }
}
