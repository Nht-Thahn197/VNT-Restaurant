<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @method static \Illuminate\Database\Eloquent\Builder where($column, $value)
 */
/**
 * @mixin \Illuminate\Database\Eloquent\Builder
 */
class Staff extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'users';
    public $timestamps = false;

    protected $fillable = [
        'code',
        'location_code', 
        'img', 
        'name', 
        'phone', 
        'cccd', 
        'email',
        'password', 
        'dob', 
        'gender', 
        'role_id',
        'start_date',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'dob' => 'date',
        'start_date' => 'date',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }
}