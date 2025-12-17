<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $targetUser = $this->route('user') ?? $this->route('id');
        
        return $user->isAdmin() || $user->id == $targetUser;
    }

    public function rules(): array
    {
        return [
            'password' => 'required|string|min:8|confirmed',
            'current_password' => 'required|string',
        ];
    }
}

