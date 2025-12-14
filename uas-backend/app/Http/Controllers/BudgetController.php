<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Models\BudgetCategory;
use App\Models\BudgetTransaction;
use App\Models\DepartmentBudget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    /**
     * Get budget(s) - can filter by department (paginated)
     */
    public function index(Request $request): JsonResponse
    {
        $query = DepartmentBudget::with(['department', 'categories', 'transactions']);

        // Filter by department_id if provided
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // Filter by fiscal_year if provided
        if ($request->has('fiscal_year')) {
            $query->where('fiscal_year', $request->fiscal_year);
        }

        $perPage = $request->input('per_page', 15);
        $budgets = $query->orderBy('fiscal_year', 'desc')->paginate($perPage);

        return response()->json([
            'data' => BudgetResource::collection($budgets->items()),
            'meta' => [
                'current_page' => $budgets->currentPage(),
                'last_page' => $budgets->lastPage(),
                'per_page' => $budgets->perPage(),
                'total' => $budgets->total(),
            ],
            'message' => 'Budgets retrieved successfully'
        ], 200);
    }

    /**
     * Get a single budget
     */
    public function show($id): JsonResponse
    {
        $budget = DepartmentBudget::with(['department', 'categories', 'transactions'])
            ->findOrFail($id);

        return response()->json([
            'data' => new BudgetResource($budget),
            'message' => 'Budget retrieved successfully'
        ], 200);
    }

    /**
     * Create or update budget (admin/accountant only)
     */
    public function store(StoreBudgetRequest $request): JsonResponse
    {
        // Check if budget already exists for this department and fiscal year
        $budget = DepartmentBudget::where('department_id', $request->department_id)
            ->where('fiscal_year', $request->fiscal_year)
            ->first();

        if ($budget) {
            // Update existing budget
            $budget->update([
                'total_budget' => $request->total_budget,
                'remaining_balance' => $request->total_budget - $budget->total_spent,
            ]);
        } else {
            // Create new budget
            $budget = DepartmentBudget::create([
                'department_id' => $request->department_id,
                'fiscal_year' => $request->fiscal_year,
                'total_budget' => $request->total_budget,
                'total_spent' => 0,
                'remaining_balance' => $request->total_budget,
                'variance' => 0,
            ]);
        }

        // Create/update categories if provided
        if ($request->has('categories')) {
            foreach ($request->categories as $categoryData) {
                BudgetCategory::updateOrCreate(
                    [
                        'department_budget_id' => $budget->id,
                        'name' => $categoryData['name'],
                    ],
                    [
                        'allocated' => $categoryData['allocated'],
                        'spent' => $categoryData['spent'] ?? 0,
                        'remaining' => $categoryData['allocated'] - ($categoryData['spent'] ?? 0),
                        'percentage' => $budget->total_budget > 0 
                            ? ($categoryData['allocated'] / $budget->total_budget) * 100 
                            : 0,
                    ]
                );
            }
        }

        $budget->load(['department', 'categories', 'transactions']);

        return response()->json([
            'data' => new BudgetResource($budget),
            'message' => 'Budget saved successfully'
        ], 201);
    }

    /**
     * Update budget (admin/accountant only)
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validator = $request->validate([
            'total_budget' => 'sometimes|numeric|min:0',
            'categories' => 'nullable|array',
            'categories.*.name' => 'required_with:categories|string|max:255',
            'categories.*.allocated' => 'required_with:categories|numeric|min:0',
            'categories.*.spent' => 'nullable|numeric|min:0',
        ]);

        $budget = DepartmentBudget::findOrFail($id);

        if (isset($validator['total_budget'])) {
            $budget->update([
                'total_budget' => $validator['total_budget'],
                'remaining_balance' => $validator['total_budget'] - $budget->total_spent,
            ]);
        }

        // Update categories if provided
        if (isset($validator['categories'])) {
            foreach ($validator['categories'] as $categoryData) {
                BudgetCategory::updateOrCreate(
                    [
                        'department_budget_id' => $budget->id,
                        'name' => $categoryData['name'],
                    ],
                    [
                        'allocated' => $categoryData['allocated'],
                        'spent' => $categoryData['spent'] ?? 0,
                        'remaining' => $categoryData['allocated'] - ($categoryData['spent'] ?? 0),
                        'percentage' => $budget->total_budget > 0 
                            ? ($categoryData['allocated'] / $budget->total_budget) * 100 
                            : 0,
                    ]
                );
            }
        }

        $budget->load(['department', 'categories', 'transactions']);

        return response()->json([
            'data' => new BudgetResource($budget),
            'message' => 'Budget updated successfully'
        ], 200);
    }

    /**
     * Delete budget (admin only)
     */
    public function destroy($id): JsonResponse
    {
        $budget = DepartmentBudget::findOrFail($id);
        $budget->delete();

        return response()->json([
            'message' => 'Budget deleted successfully'
        ], 200);
    }

    /**
     * Add budget transaction (admin/accountant only)
     */
    public function addTransaction(Request $request): JsonResponse
    {
        $validator = $request->validate([
            'department_budget_id' => 'required|exists:department_budgets,id',
            'budget_category_id' => 'nullable|exists:budget_categories,id',
            'transaction_date' => 'required|date',
            'description' => 'required|string|max:255',
            'category_name' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'type' => 'required|in:income,expense',
            'status' => 'nullable|in:completed,pending,overdue',
        ]);

        $budget = DepartmentBudget::findOrFail($validator['department_budget_id']);

        $transaction = BudgetTransaction::create([
            'department_budget_id' => $validator['department_budget_id'],
            'budget_category_id' => $validator['budget_category_id'] ?? null,
            'transaction_date' => $validator['transaction_date'],
            'description' => $validator['description'],
            'category_name' => $validator['category_name'],
            'amount' => abs($validator['amount']),
            'type' => $validator['type'],
            'status' => $validator['status'] ?? 'completed',
        ]);

        // Update budget totals if transaction is completed
        if ($transaction->status === 'completed') {
            if ($transaction->type === 'expense') {
                $budget->increment('total_spent', $transaction->amount);
                $budget->decrement('remaining_balance', $transaction->amount);
            } else {
                $budget->decrement('total_spent', $transaction->amount);
                $budget->increment('remaining_balance', $transaction->amount);
            }

            // Update category if provided
            if ($transaction->budget_category_id) {
                $category = BudgetCategory::find($transaction->budget_category_id);
                if ($category) {
                    if ($transaction->type === 'expense') {
                        $category->increment('spent', $transaction->amount);
                        $category->decrement('remaining', $transaction->amount);
                    } else {
                        $category->decrement('spent', $transaction->amount);
                        $category->increment('remaining', $transaction->amount);
                    }
                }
            }

            $budget->update([
                'variance' => $budget->total_budget - $budget->total_spent
            ]);
        }

        $transaction->load(['departmentBudget', 'budgetCategory']);

        return response()->json([
            'data' => [
                'id' => $transaction->id,
                'transactionDate' => $transaction->transaction_date->toDateString(),
                'description' => $transaction->description,
                'categoryName' => $transaction->category_name,
                'amount' => (float) $transaction->amount,
                'type' => $transaction->type,
                'status' => $transaction->status,
            ],
            'message' => 'Transaction added successfully'
        ], 201);
    }
}
