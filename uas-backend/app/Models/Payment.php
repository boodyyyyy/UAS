<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'invoice_id',
        'student_id',
        'amount',
        'method',
        'status',
        'payment_date',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    /**
     * Get the invoice that owns the payment.
     */
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the student that owns the payment.
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}

