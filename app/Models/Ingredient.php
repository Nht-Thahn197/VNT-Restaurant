<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    protected $table = 'ingredient';

    protected $fillable = [
        'code',
        'category_id',
        'name',
        'quantity',
        'unit',
        'price',
    ];

    public $timestamps = false;

    public function category()
    {
        return $this->belongsTo(CategoryIngredient::class, 'category_id');
    }
}
