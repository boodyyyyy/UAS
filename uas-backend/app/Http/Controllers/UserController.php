<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Get all users (admin only, paginated)
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['student', 'staff']);

        // Filter by role if provided
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by is_active if provided
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => UserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'message' => 'Users retrieved successfully'
        ], 200);
    }

    /**
     * Get a single user
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $targetUser = User::with(['student.department', 'staff.department'])->findOrFail($id);

        // Students can only view their own profile
        if ($user->isStudent() && $user->id !== $targetUser->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'data' => new UserResource($targetUser),
            'message' => 'User retrieved successfully'
        ], 200);
    }

    /**
     * Create a new user (admin only)
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create([
            'username' => $request->username,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'picture' => $request->picture,
            'is_active' => true,
        ]);

        $user->load(['student', 'staff']);

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'User created successfully'
        ], 201);
    }

    /**
     * Update user (admin or self)
     */
    public function update(UpdateUserRequest $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();

        // Only admin can change role and is_active
        $updateData = $request->only(['name', 'email']);
        
        // Handle picture separately to ensure it's included even if empty string
        if ($request->has('picture')) {
            $updateData['picture'] = $request->input('picture');
        }
        
        if ($currentUser->isAdmin()) {
            if ($request->has('role')) {
                $updateData['role'] = $request->role;
            }
            if ($request->has('is_active')) {
                $updateData['is_active'] = $request->is_active;
            }
        }

        // Handle newsletter subscription
        $wasSubscribed = $user->newsletter_subscribed;
        if ($request->has('newsletter_subscribed')) {
            $updateData['newsletter_subscribed'] = $request->boolean('newsletter_subscribed');
        }

        $user->update($updateData);
        $user->load(['student', 'staff']);

        // Send welcome email if user just subscribed
        // Email sending is optional - if it fails, the user update still succeeds
        $emailSent = false;
        if (!$wasSubscribed && $user->newsletter_subscribed) {
            $emailSent = $this->sendNewsletterEmail($user);
        }

        $message = 'User updated successfully';
        if ($emailSent) {
            $message .= '. Welcome email sent!';
        }

        return response()->json([
            'data' => new UserResource($user),
            'message' => $message
        ], 200);
    }

    /**
     * Send newsletter welcome email (with error handling)
     */
    private function sendNewsletterEmail(User $user): bool
    {
        // Check if BrevoEmailService class exists and can be loaded
        if (!class_exists(\App\Services\BrevoEmailService::class)) {
            Log::warning('BrevoEmailService class not found. Email sending disabled.');
            return false;
        }

        try {
            $emailService = app(\App\Services\BrevoEmailService::class);
            return $emailService->sendNewsletterWelcome($user);
        } catch (\Throwable $e) {
            // Catch all errors
            Log::error('Error sending newsletter subscription email: ' . $e->getMessage(), [
                'exception' => get_class($e)
            ]);
            return false;
        }
    }

    /**
     * Update user password (admin or self)
     */
    public function updatePassword(UpdatePasswordRequest $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();

        // If not admin, verify current password
        if (!$currentUser->isAdmin()) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect'
                ], 422);
            }
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ], 200);
    }

    /**
     * Delete user (admin only)
     */
    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ], 200);
    }
}
