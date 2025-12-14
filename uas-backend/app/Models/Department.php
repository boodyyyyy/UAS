<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    /**
     * Get the students for the department.
     */
    public function students()
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Get the staff for the department.
     */
    public function staff()
    {
        return $this->hasMany(Staff::class);
    }

    /**
     * Get the budgets for the department.
     */
    public function budgets()
    {
        return $this->hasMany(DepartmentBudget::class);
    }
}

