<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\InvoiceDetail;

class Invoice extends Model
{
    use HasFactory;

    protected $table = 'invoice'; 
    protected $primaryKey = 'id'; 
    public $incrementing = true;
    protected $keyType = 'int';

    public $timestamps = false;
    
    protected $fillable = [ 
        'code', 
        'table_id', 
        'user_id', 
        'promotion_id', 
        'total', 
        'discount', 
        'pay_amount', 
        'payment_method',
        'status', 
        'time_start', 
        'time_end', 
    ]; 

    protected $casts = [
    'time_start' => 'datetime',
    'time_end'   => 'datetime',
    ];

    public function user() 
    { 
        return $this->belongsTo(Staff::class, 'user_id', 'id'); 
    } 

    public function table() 
    { 
        return $this->belongsTo(Table::class, 'table_id', 'id'); 
    } 

    public function promotion() 
    { 
        return $this->belongsTo(Promotion::class, 'promotion_id', 'id'); 
    } 

    public function setDiscountAttribute($value) 
    { 
        $this->attributes['discount'] = $value; 
        if (isset($this->attributes['total'])) { 
            $this->attributes['pay_amount'] = $this->attributes['total'] - $value; 
        } 
    }

    public function details()
    {
        return $this->hasMany(InvoiceDetail::class, 'invoice_id', 'id');
    }
    
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

}
