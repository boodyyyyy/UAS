<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'staffId' => $this->staff_id,
            'employeeId' => $this->whenLoaded('staff', fn() => $this->staff->employee_id ?? 'N/A'),
            'employeeName' => $this->whenLoaded('staff', fn() => $this->staff->user->name ?? 'N/A'),
            'department' => $this->when(
                $this->relationLoaded('staff') && $this->staff && $this->staff->relationLoaded('department'),
                fn() => $this->staff->department->name ?? 'N/A'
            ),
            'grossPay' => (float) $this->gross_pay,
            'allowances' => (float) $this->allowances,
            'deductions' => (float) $this->deductions,
            'netPay' => (float) $this->net_pay,
            'payPeriod' => $this->pay_period,
            'payDate' => $this->pay_date->toDateString(),
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}

