<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transactionDate' => $this->transaction_date->toDateString(),
            'description' => $this->description,
            'categoryName' => $this->category_name,
            'amount' => (float) $this->amount,
            'type' => $this->type,
            'status' => $this->status,
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}

