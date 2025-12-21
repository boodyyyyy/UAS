<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudgetCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_budget_id',
        'name',
        'allocated',
        'spent',
        'remaining',
        'percentage',
    ];

    protected $casts = [
        'allocated' => 'decimal:2',
        'spent' => 'decimal:2',
        'remaining' => 'decimal:2',
        'percentage' => 'decimal:2',
    ];

    /**
     * Get the department budget that owns the category.
     */
    public function departmentBudget()
    {
        return $this->belongsTo(DepartmentBudget::class);
    }

    /**
     * Get the transactions for the category.
     */
    public function transactions()
    {
        return $this->hasMany(BudgetTransaction::class);
    }
}

