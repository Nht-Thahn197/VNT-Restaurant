<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportDetail extends Model
{
    use HasFactory;
    protected $table = 'import_details';

    protected $fillable = [
        'import_id',
        'ingredient_id',
        'quantity',
        'price'
    ];

    public function import()
    {
        return $this->belongsTo(Import::class, 'import_id');
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class, 'ingredient_id');
    }

}
