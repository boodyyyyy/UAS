<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentBudget extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'fiscal_year',
        'total_budget',
        'total_spent',
        'remaining_balance',
        'variance',
    ];

    protected $casts = [
        'total_budget' => 'decimal:2',
        'total_spent' => 'decimal:2',
        'remaining_balance' => 'decimal:2',
        'variance' => 'decimal:2',
    ];

    /**
     * Get the department that owns the budget.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the categories for the budget.
     */
    public function categories()
    {
        return $this->hasMany(BudgetCategory::class);
    }

    /**
     * Get the transactions for the budget.
     */
    public function transactions()
    {
        return $this->hasMany(BudgetTransaction::class);
    }
}

