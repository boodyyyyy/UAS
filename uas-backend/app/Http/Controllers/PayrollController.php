<?php

namespace App\Http\Controllers;

use App\Http\Resources\PayrollResource;
use App\Models\Payroll;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    /**
     * Get all payrolls (admin/accountant only, paginated)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payroll::with(['staff.user', 'staff.department']);

        // Filter by staff_id if provided
        if ($request->has('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }

        // Filter by pay_period if provided
        if ($request->has('pay_period')) {
            $query->where('pay_period', $request->pay_period);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('pay_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('pay_date', '<=', $request->end_date);
        }

        $perPage = $request->input('per_page', 15);
        $payrolls = $query->orderBy('pay_date', 'desc')->paginate($perPage);

        return response()->json([
            'data' => PayrollResource::collection($payrolls->items()),
            'meta' => [
                'current_page' => $payrolls->currentPage(),
                'last_page' => $payrolls->lastPage(),
                'per_page' => $payrolls->perPage(),
                'total' => $payrolls->total(),
            ],
            'message' => 'Payrolls retrieved successfully'
        ], 200);
    }

    /**
     * Get a single payroll
     */
    public function show($id): JsonResponse
    {
        $payroll = Payroll::with(['staff.user', 'staff.department'])->findOrFail($id);

        return response()->json([
            'data' => new PayrollResource($payroll),
            'message' => 'Payroll retrieved successfully'
        ], 200);
    }

    /**
     * Create a new payroll (admin/accountant only)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'gross_pay' => 'required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'pay_period' => 'required|string|max:255',
            'pay_date' => 'required|date',
        ]);

        $netPay = $validator['gross_pay'] + ($validator['allowances'] ?? 0) - ($validator['deductions'] ?? 0);

        $payroll = Payroll::create([
            'staff_id' => $validator['staff_id'],
            'gross_pay' => $validator['gross_pay'],
            'allowances' => $validator['allowances'] ?? 0,
            'deductions' => $validator['deductions'] ?? 0,
            'net_pay' => $netPay,
            'pay_period' => $validator['pay_period'],
            'pay_date' => $validator['pay_date'],
        ]);

        $payroll->load(['staff.user', 'staff.department']);

        return response()->json([
            'data' => new PayrollResource($payroll),
            'message' => 'Payroll created successfully'
        ], 201);
    }

    /**
     * Generate payroll report for a period
     */
    public function generateReport(Request $request): JsonResponse
    {
        $validator = $request->validate([
            'period' => 'required|string',
        ]);

        $payrolls = Payroll::with(['staff.user', 'staff.department'])
            ->where('pay_period', $validator['period'])
            ->get();

        $totalPayrollCost = $payrolls->sum('net_pay');
        $employeesPaid = $payrolls->count();
        $averageNetPay = $employeesPaid > 0 ? $totalPayrollCost / $employeesPaid : 0;

        return response()->json([
            'data' => [
                'period' => $validator['period'],
                'totalPayrollCost' => (float) $totalPayrollCost,
                'employeesPaid' => $employeesPaid,
                'averageNetPay' => (float) $averageNetPay,
                'payrolls' => PayrollResource::collection($payrolls),
            ],
            'message' => 'Payroll report generated successfully'
        ], 200);
    }
}
