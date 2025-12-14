<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user->isAdmin() || $user->isAccounting();
    }

    public function rules(): array
    {
        return [
            'department_id' => 'required|exists:departments,id',
            'fiscal_year' => 'required|string|max:255',
            'total_budget' => 'required|numeric|min:0',
            'categories' => 'nullable|array',
            'categories.*.name' => 'required_with:categories|string|max:255',
            'categories.*.allocated' => 'required_with:categories|numeric|min:0',
            'categories.*.spent' => 'nullable|numeric|min:0',
        ];
    }
}

