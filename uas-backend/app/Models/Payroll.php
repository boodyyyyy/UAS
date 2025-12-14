<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'gross_pay',
        'allowances',
        'deductions',
        'net_pay',
        'pay_period',
        'pay_date',
    ];

    protected $casts = [
        'gross_pay' => 'decimal:2',
        'allowances' => 'decimal:2',
        'deductions' => 'decimal:2',
        'net_pay' => 'decimal:2',
        'pay_date' => 'date',
    ];

    /**
     * Get the staff that owns the payroll.
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}

