<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'departmentId' => $this->department_id,
            'department' => $this->whenLoaded('department', fn() => $this->department->name),
            'fiscalYear' => $this->fiscal_year,
            'totalBudget' => (float) $this->total_budget,
            'totalSpent' => (float) $this->total_spent,
            'remainingBalance' => (float) $this->remaining_balance,
            'variance' => (float) $this->variance,
            'spentPercentage' => $this->total_budget > 0 
                ? (float) (($this->total_spent / $this->total_budget) * 100)
                : 0,
            'categories' => BudgetCategoryResource::collection($this->whenLoaded('categories')),
            'transactions' => BudgetTransactionResource::collection($this->whenLoaded('transactions')),
            'createdAt' => $this->created_at->toIso8601String(),
            'updatedAt' => $this->updated_at->toIso8601String(),
        ];
    }
}

