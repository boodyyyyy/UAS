<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $targetUser = $this->route('user') ?? $this->route('id');
        
        // Admin can update anyone, users can update themselves
        return $user->isAdmin() || $user->id == $targetUser;
    }

    public function rules(): array
    {
        $userId = $this->route('user') ?? $this->route('id');
        
        return [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $userId,
            'picture' => 'nullable|string|max:10485760', // ~10MB for base64 images
            'role' => 'sometimes|in:admin,accounting,student',
            'is_active' => 'sometimes|boolean',
            'newsletter_subscribed' => 'sometimes|boolean',
        ];
    }
}

