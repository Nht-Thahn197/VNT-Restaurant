<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    protected $table = 'recipe';
    protected $fillable = [
        'product_id',
        'ingredient_id',
        'quantity',
        'created_at',
        'updated_at'
    ];

    public function ingredient()
    { 
        return $this->belongsTo(Ingredient::class); 
    }

    public function product()
    { 
        return $this->belongsTo(Product::class); 
    }
}
