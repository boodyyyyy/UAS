<?php

namespace App\Http\Controllers;

use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StudentFeeController extends Controller
{
    /**
     * Get student fees (invoices for students, paginated)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Invoice::with(['student.user', 'payments']);

        // Students can only see their own fees
        if ($user->isStudent() && $user->student) {
            $query->where('student_id', $user->student->id);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $status = $request->status;
            if ($status === 'paid') {
                $query->where('status', 'paid');
            } elseif ($status === 'overdue') {
                $query->where('status', 'overdue');
            } else {
                $query->where('status', 'pending');
            }
        }

        $perPage = $request->input('per_page', 15);
        $invoices = $query->orderBy('due_date', 'asc')->paginate($perPage);

        return response()->json([
            'data' => InvoiceResource::collection($invoices->items()),
            'meta' => [
                'current_page' => $invoices->currentPage(),
                'last_page' => $invoices->lastPage(),
                'per_page' => $invoices->perPage(),
                'total' => $invoices->total(),
            ],
            'message' => 'Student fees retrieved successfully'
        ], 200);
    }

    /**
     * Create student fee (admin/accountant only)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = $request->validate([
            'student_id' => 'required|exists:students,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
        ]);

        // Generate unique invoice ID
        $invoiceId = 'INV-' . date('Y') . '-' . str_pad(Invoice::count() + 1, 3, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'invoice_id' => $invoiceId,
            'student_id' => $validator['student_id'],
            'description' => $validator['description'],
            'amount' => $validator['amount'],
            'issue_date' => Carbon::now(),
            'due_date' => $validator['due_date'],
            'status' => Carbon::parse($validator['due_date'])->isPast() ? 'overdue' : 'pending',
        ]);

        $invoice->load(['student.user', 'payments']);

        return response()->json([
            'data' => new InvoiceResource($invoice),
            'message' => 'Student fee created successfully'
        ], 201);
    }

    /**
     * Update student fee status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validator = $request->validate([
            'status' => 'required|in:pending,paid,overdue',
            'payment_date' => 'nullable|date',
        ]);

        $invoice = Invoice::findOrFail($id);

        // Map status
        $invoiceStatus = $validator['status'] === 'paid' ? 'paid' : ($validator['status'] === 'overdue' ? 'overdue' : 'pending');
        $invoice->update(['status' => $invoiceStatus]);

        $invoice->load(['student.user', 'payments']);

        return response()->json([
            'data' => new InvoiceResource($invoice),
            'message' => 'Student fee status updated successfully'
        ], 200);
    }
}
