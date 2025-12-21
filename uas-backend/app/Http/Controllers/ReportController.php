<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Payroll;
use App\Models\DepartmentBudget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Get financial summary report (admin/accountant only)
     */
    public function financialSummary(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth());

        // Total invoices
        $totalInvoices = Invoice::whereBetween('issue_date', [$startDate, $endDate])->count();
        $totalInvoiceAmount = Invoice::whereBetween('issue_date', [$startDate, $endDate])->sum('amount');

        // Paid invoices
        $paidInvoices = Invoice::where('status', 'paid')
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->count();
        $paidAmount = Invoice::where('status', 'paid')
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->sum('amount');

        // Pending invoices
        $pendingInvoices = Invoice::where('status', 'pending')
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->count();
        $pendingAmount = Invoice::where('status', 'pending')
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->sum('amount');

        // Overdue invoices
        $overdueInvoices = Invoice::where('status', 'overdue')
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->count();
        $overdueAmount = Invoice::where('status', 'overdue')
            ->whereBetween('issue_date', [$startDate, $endDate])
            ->sum('amount');

        // Total payments
        $totalPayments = Payment::whereBetween('payment_date', [$startDate, $endDate])->count();
        $totalPaymentAmount = Payment::where('status', 'completed')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->sum('amount');

        // Total payroll
        $totalPayroll = Payroll::whereBetween('pay_date', [$startDate, $endDate])->sum('net_pay');
        $payrollCount = Payroll::whereBetween('pay_date', [$startDate, $endDate])->count();

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
                'invoices' => [
                    'total' => $totalInvoices,
                    'total_amount' => (float) $totalInvoiceAmount,
                    'paid' => $paidInvoices,
                    'paid_amount' => (float) $paidAmount,
                    'pending' => $pendingInvoices,
                    'pending_amount' => (float) $pendingAmount,
                    'overdue' => $overdueInvoices,
                    'overdue_amount' => (float) $overdueAmount,
                ],
                'payments' => [
                    'total' => $totalPayments,
                    'total_amount' => (float) $totalPaymentAmount,
                ],
                'payroll' => [
                    'total_amount' => (float) $totalPayroll,
                    'count' => $payrollCount,
                ],
                'net_income' => (float) ($totalPaymentAmount - $totalPayroll),
            ]
        ], 200);
    }

    /**
     * Get department budget report
     */
    public function departmentBudgets(Request $request)
    {
        $fiscalYear = $request->input('fiscal_year', date('Y'));

        $budgets = DepartmentBudget::with(['department', 'categories'])
            ->where('fiscal_year', $fiscalYear)
            ->get();

        $formattedBudgets = $budgets->map(function ($budget) {
            return [
                'department' => $budget->department->name,
                'fiscal_year' => $budget->fiscal_year,
                'total_budget' => (float) $budget->total_budget,
                'total_spent' => (float) $budget->total_spent,
                'remaining_balance' => (float) $budget->remaining_balance,
                'spent_percentage' => $budget->total_budget > 0 
                    ? (float) (($budget->total_spent / $budget->total_budget) * 100)
                    : 0,
                'categories' => $budget->categories->map(function ($category) {
                    return [
                        'name' => $category->name,
                        'allocated' => (float) $category->allocated,
                        'spent' => (float) $category->spent,
                        'remaining' => (float) $category->remaining,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedBudgets
        ], 200);
    }
}

