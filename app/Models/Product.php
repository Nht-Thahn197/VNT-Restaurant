<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'product';
    protected $primaryKey = 'id';

    protected $fillable = [
        'code',
        'category_id',
        'img',
        'name',
        'units',
        'type_menu',
        'price'
    ];

    public function recipes()
    { 
        return $this->hasMany(Recipe::class); 
    }
    
    public function category()
    {
        return $this->belongsTo(CategoryProduct::class, 'category_id');
    }
}

