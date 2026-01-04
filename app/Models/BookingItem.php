<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingItem extends Model
{
    use HasFactory;
    protected $table = 'booking_item';
    public $timestamps = false;

    protected $fillable = [
        'booking_id',
        'product_id',
        'product_name',
        'qty',
        'price',
        'note'
    ];
}
