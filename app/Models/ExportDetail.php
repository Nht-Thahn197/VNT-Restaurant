<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExportDetail extends Model
{
    use HasFactory;
    protected $table = 'export_details';
    public $timestamps = false;

    protected $fillable = [
        'export_id',
        'ingredient_id',
        'quantity',
        'price'
    ];

    public function export()
    {
        return $this->belongsTo(Export::class, 'export_id');
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class, 'ingredient_id');
    }
}
