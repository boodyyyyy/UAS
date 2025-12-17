<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transactionId' => $this->transaction_id,
            'invoiceId' => $this->invoice_id,
            'studentId' => $this->student_id,
            'studentName' => $this->whenLoaded('student', fn() => $this->student->user->name ?? 'N/A'),
            'amount' => (float) $this->amount,
            'method' => $this->method,
            'status' => $this->status,
            'paymentDate' => $this->payment_date->toDateString(),
            'description' => $this->description,
            'invoice' => new InvoiceResource($this->whenLoaded('invoice')),
            'createdAt' => $this->created_at->toIso8601String(),
            'updatedAt' => $this->updated_at->toIso8601String(),
        ];
    }
}

