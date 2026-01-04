<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    protected $table = 'area';
    protected $fillable = ['name',];

    public function tables()
    {
        return $this->hasMany(Table::class, 'area_id');
    }
    public $timestamps = false;
}
