<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankTransaction extends Model
{
    use HasFactory;

    protected $table = 'bank_transactions';

    protected $fillable = [
        'gateway_transaction_id',
        'amount',
        'description',
        'reference_code',
        'account_number',
        'status',
    ];
}
