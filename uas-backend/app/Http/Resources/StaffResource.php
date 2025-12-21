<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employeeId' => $this->employee_id,
            'userId' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'departmentId' => $this->department_id,
            'department' => $this->whenLoaded('department', fn() => $this->department->name),
            'phone' => $this->phone,
            'dateOfBirth' => $this->date_of_birth?->toDateString(),
            'address' => $this->address,
            'position' => $this->position,
            'salary' => (float) $this->salary,
            'hireDate' => $this->hire_date->toDateString(),
            'status' => $this->status,
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}

