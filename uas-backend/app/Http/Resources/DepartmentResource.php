<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'studentsCount' => $this->when(isset($this->students_count), $this->students_count),
            'staffCount' => $this->when(isset($this->staff_count), $this->staff_count),
            'budgetsCount' => $this->when(isset($this->budgets_count), $this->budgets_count),
            'createdAt' => $this->created_at->toIso8601String(),
            'updatedAt' => $this->updated_at->toIso8601String(),
        ];
    }
}

