<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user->isAdmin() || $user->isAccounting();
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'status' => 'sometimes|in:pending,paid,overdue,cancelled',
        ];
    }
}

