<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoryIngredient extends Model
{
    protected $table = 'category_ingredient';

    protected $fillable = [
        'name',
    ];

    public $timestamps = false; // Nếu không có created_at, updated_at
}
