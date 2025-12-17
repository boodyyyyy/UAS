<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Get all departments (paginated)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Department::withCount(['students', 'staff', 'budgets']);

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 15);
        $departments = $query->orderBy('name')->paginate($perPage);

        return response()->json([
            'data' => DepartmentResource::collection($departments->items()),
            'meta' => [
                'current_page' => $departments->currentPage(),
                'last_page' => $departments->lastPage(),
                'per_page' => $departments->perPage(),
                'total' => $departments->total(),
            ],
            'message' => 'Departments retrieved successfully'
        ], 200);
    }

    /**
     * Get a single department
     */
    public function show($id): JsonResponse
    {
        $department = Department::with(['students.user', 'staff.user', 'budgets'])
            ->findOrFail($id);

        return response()->json([
            'data' => new DepartmentResource($department),
            'message' => 'Department retrieved successfully'
        ], 200);
    }

    /**
     * Create department (admin only)
     */
    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = Department::create([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
        ]);

        return response()->json([
            'data' => new DepartmentResource($department),
            'message' => 'Department created successfully'
        ], 201);
    }

    /**
     * Update department (admin only)
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validator = $request->validate([
            'name' => 'sometimes|string|max:255|unique:departments,name,' . $id,
            'code' => 'sometimes|string|max:255|unique:departments,code,' . $id,
            'description' => 'nullable|string',
        ]);

        $department = Department::findOrFail($id);
        $department->update($validator);

        return response()->json([
            'data' => new DepartmentResource($department),
            'message' => 'Department updated successfully'
        ], 200);
    }

    /**
     * Delete department (admin only)
     */
    public function destroy($id): JsonResponse
    {
        $department = Department::findOrFail($id);
        $department->delete();

        return response()->json([
            'message' => 'Department deleted successfully'
        ], 200);
    }
}
