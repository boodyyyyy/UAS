<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'username' => $request->username,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
        $user->load(['student', 'staff']);

        $response = response()->json([
            'data' => new UserResource($user),
            'meta' => [
                'token' => $token,
            ],
            'message' => 'User registered successfully'
        ], 201);

        // Set secure HTTP-only cookie for SPA
        $response->cookie('auth_token', $token, 60 * 24 * 7, '/', null, false, true); // 7 days, httpOnly

        return $response;
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Account is inactive'
            ], 403);
        }

        // Create token and set cookie for SPA authentication
        $token = $user->createToken('auth_token')->plainTextToken;
        $user->load(['student', 'staff']);

        $response = response()->json([
            'data' => new UserResource($user),
            'meta' => [
                'token' => $token,
            ],
            'message' => 'Login successful'
        ], 200);

        // Set secure HTTP-only cookie for SPA
        $response->cookie('auth_token', $token, 60 * 24 * 7, '/', null, false, true); // 7 days, httpOnly

        return $response;
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        $response = response()->json([
            'message' => 'Logged out successfully'
        ], 200);

        // Clear auth cookie
        $response->cookie('auth_token', '', -1, '/', null, false, true);

        return $response;
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['student.department', 'staff.department']);

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'User retrieved successfully'
        ], 200);
    }
}
