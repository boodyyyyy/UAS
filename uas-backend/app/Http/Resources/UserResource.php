<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'picture' => $this->picture,
            'isActive' => $this->is_active,
            'studentId' => $this->whenLoaded('student', fn() => $this->student->student_id),
            'employeeId' => $this->whenLoaded('staff', fn() => $this->staff->employee_id),
            'department' => $this->when(
                $this->relationLoaded('student') || $this->relationLoaded('staff'),
                function () {
                    if ($this->relationLoaded('student') && $this->student) {
                        return $this->student->department->name ?? null;
                    }
                    if ($this->relationLoaded('staff') && $this->staff) {
                        return $this->staff->department->name ?? null;
                    }
                    return null;
                }
            ),
            'createdAt' => $this->created_at->toIso8601String(),
            'updatedAt' => $this->updated_at->toIso8601String(),
        ];
    }
}

