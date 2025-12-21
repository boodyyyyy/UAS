<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user->isAdmin() || $user->isAccounting();
    }

    public function rules(): array
    {
        return [
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0',
            'method' => 'required|in:credit_card,debit_card,bank_transfer,ach_transfer',
            'payment_date' => 'required|date',
            'description' => 'nullable|string|max:255',
            'status' => 'sometimes|in:pending,completed,failed,refunded',
        ];
    }
}

