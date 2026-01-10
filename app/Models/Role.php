<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'roles';
    protected $fillable = [
        'name',
        'permission',
    ];

    public $timestamps = false;
    
    protected $casts = [
        'permission' => 'array'
    ];
    
    public function tables()
    {
        return $this->hasMany(Staff::class, 'role_id');
    }
    
}
