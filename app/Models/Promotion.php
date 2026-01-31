<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $table = 'promotion';
    public $timestamps = false;

    protected $fillable = [
        'location_id',
        'name',
        'type_id',
        'description',
        'discount',
        'start_date',
        'end_date',
        'images',
        'create_at'
    ];

    public function location() { 
        return $this->belongsTo(Location::class, 'location_id'); 
    }

    public function type() { 
        return $this->belongsTo(PromotionType::class, 'type_id'); 
    }
}
