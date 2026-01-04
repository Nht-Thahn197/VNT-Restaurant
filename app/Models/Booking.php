<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $table = 'booking';

    protected $fillable = [
        'code',
        'location_id',
        'customer_id',
        'customer_name',
        'phone',
        'booking_time',
        'guest_count',
        'area_id',
        'table_id',
        'promotion_id',
        'status',
        'note',
        'created_by'
    ];

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function promotion()
    {
        return $this->belongsTo(
            Promotion::class,
            'promotion_id', // FK trong booking
            'id'            // PK trong promotion
        );
    }

    public function items()
    {
        return $this->hasMany(BookingItem::class, 'booking_id');
    }

    public function table() 
    { 
        return $this->belongsTo(Table::class, 'table_id', 'id'); 
    } 
    public $timestamps = false;
}
