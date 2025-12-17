<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudgetTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_budget_id',
        'budget_category_id',
        'transaction_date',
        'description',
        'category_name',
        'amount',
        'type',
        'status',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the department budget that owns the transaction.
     */
    public function departmentBudget()
    {
        return $this->belongsTo(DepartmentBudget::class);
    }

    /**
     * Get the budget category that owns the transaction.
     */
    public function budgetCategory()
    {
        return $this->belongsTo(BudgetCategory::class);
    }
}

