<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'studentId' => $this->student_id,
            'userId' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'departmentId' => $this->department_id,
            'department' => $this->whenLoaded('department', fn() => $this->department->name),
            'phone' => $this->phone,
            'dateOfBirth' => $this->date_of_birth?->toDateString(),
            'address' => $this->address,
            'status' => $this->status,
            'enrollmentDate' => $this->enrollment_date->toDateString(),
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}

