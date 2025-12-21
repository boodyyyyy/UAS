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
            // Accept either student_id or student_username
            'student_id' => 'required_without:student_username|exists:students,id',
            'student_username' => 'required_without:student_id|string|max:255',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'status' => 'sometimes|in:pending,paid,overdue,cancelled',
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.required_without' => 'Either student ID or student username is required.',
            'student_id.exists' => 'The selected student ID does not exist.',
            'student_username.required_without' => 'Either student ID or student username is required.',
            'student_username.string' => 'Student username must be a valid string.',
            'description.required' => 'Description is required.',
            'amount.required' => 'Amount is required.',
            'amount.numeric' => 'Amount must be a valid number.',
            'amount.min' => 'Amount must be at least 0.',
            'issue_date.required' => 'Issue date is required.',
            'issue_date.date' => 'Issue date must be a valid date.',
            'due_date.required' => 'Due date is required.',
            'due_date.date' => 'Due date must be a valid date.',
            'due_date.after_or_equal' => 'Due date must be on or after the issue date.',
        ];
    }
}

