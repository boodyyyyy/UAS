<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoiceId' => $this->invoice_id,
            'studentId' => $this->student_id,
            'studentName' => $this->whenLoaded('student', fn() => $this->student->user->name ?? 'N/A'),
            'description' => $this->description,
            'amount' => (float) $this->amount,
            'issueDate' => $this->issue_date->toDateString(),
            'dueDate' => $this->due_date->toDateString(),
            'status' => $this->status,
            'totalPaid' => $this->when(
                $this->relationLoaded('payments'),
                fn() => (float) $this->payments->where('status', 'completed')->sum('amount')
            ),
            'remainingAmount' => $this->when(
                $this->relationLoaded('payments'),
                fn() => (float) max(0, $this->amount - $this->payments->where('status', 'completed')->sum('amount'))
            ),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'createdAt' => $this->created_at->toIso8601String(),
            'updatedAt' => $this->updated_at->toIso8601String(),
        ];
    }
}

