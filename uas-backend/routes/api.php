<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\StudentFeeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\HealthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check (public)
Route::get('/health', [HealthController::class, 'check']);

// Public authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // User Profile CRUD
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->middleware('role:admin');
        Route::post('/', [UserController::class, 'store'])->middleware('role:admin');
        Route::get('/{id}', [UserController::class, 'show']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::patch('/{id}', [UserController::class, 'update']);
        Route::put('/{id}/password', [UserController::class, 'updatePassword']);
        Route::delete('/{id}', [UserController::class, 'destroy'])->middleware('role:admin');
    });

    // Department routes (all authenticated users can view)
    Route::prefix('departments')->group(function () {
        Route::get('/', [DepartmentController::class, 'index']);
        Route::get('/{id}', [DepartmentController::class, 'show']);
        
        // Admin only routes
        Route::middleware('role:admin')->group(function () {
            Route::post('/', [DepartmentController::class, 'store']);
            Route::put('/{id}', [DepartmentController::class, 'update']);
            Route::patch('/{id}', [DepartmentController::class, 'update']);
            Route::delete('/{id}', [DepartmentController::class, 'destroy']);
        });
    });

    // Invoice routes
    Route::prefix('invoices')->group(function () {
        Route::get('/', [InvoiceController::class, 'index']);
        Route::get('/{id}', [InvoiceController::class, 'show']);
        
        // Admin and accountant can create/update/delete invoices
        Route::middleware('role:admin,accounting')->group(function () {
            Route::post('/', [InvoiceController::class, 'store']);
            Route::put('/{id}', [InvoiceController::class, 'update']);
            Route::patch('/{id}', [InvoiceController::class, 'update']);
            Route::delete('/{id}', [InvoiceController::class, 'destroy']);
        });
        
        // Student can pay their own invoice
        Route::post('/{id}/pay', [PaymentController::class, 'payInvoice']);
    });

    // Payment routes
    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'index']);
        Route::get('/{id}', [PaymentController::class, 'show']);
        
        // Admin and accountant can create payments and update status
        Route::middleware('role:admin,accounting')->group(function () {
            Route::post('/', [PaymentController::class, 'store']);
            Route::patch('/{id}/status', [PaymentController::class, 'updateStatus']);
        });
    });

    // Payroll routes (admin and accountant only)
    Route::middleware('role:admin,accounting')->prefix('payrolls')->group(function () {
        Route::get('/', [PayrollController::class, 'index']);
        Route::get('/{id}', [PayrollController::class, 'show']);
        Route::post('/', [PayrollController::class, 'store']);
        Route::post('/report', [PayrollController::class, 'generateReport']);
    });

    // Budget routes
    Route::prefix('budgets')->group(function () {
        Route::get('/', [BudgetController::class, 'index']);
        Route::get('/{id}', [BudgetController::class, 'show']);
        
        // Admin and accountant can manage budgets
        Route::middleware('role:admin,accounting')->group(function () {
            Route::post('/', [BudgetController::class, 'store']);
            Route::put('/{id}', [BudgetController::class, 'update']);
            Route::patch('/{id}', [BudgetController::class, 'update']);
            Route::delete('/{id}', [BudgetController::class, 'destroy']);
            Route::post('/transactions', [BudgetController::class, 'addTransaction']);
        });
    });

    // Student fee routes
    Route::prefix('student-fees')->group(function () {
        Route::get('/', [StudentFeeController::class, 'index']);
        
        // Admin and accountant can create/update student fees
        Route::middleware('role:admin,accounting')->group(function () {
            Route::post('/', [StudentFeeController::class, 'store']);
            Route::patch('/{id}/status', [StudentFeeController::class, 'updateStatus']);
        });
    });

    // Report routes (admin and accountant only)
    Route::middleware('role:admin,accounting')->prefix('reports')->group(function () {
        Route::get('/financial-summary', [ReportController::class, 'financialSummary']);
        Route::get('/department-budgets', [ReportController::class, 'departmentBudgets']);
    });
});
