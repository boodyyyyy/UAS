<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    /**
     * Get all invoices (with role-based filtering and pagination)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Invoice::with(['student.user', 'student.department', 'payments']);

        // Students can only see their own invoices
        if ($user->isStudent() && $user->student) {
            $query->where('student_id', $user->student->id);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by student_id (for admin/accountant)
        if ($request->has('student_id') && !$user->isStudent()) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('issue_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('issue_date', '<=', $request->end_date);
        }

        // Filter by due_date range
        if ($request->has('due_start_date')) {
            $query->where('due_date', '>=', $request->due_start_date);
        }
        if ($request->has('due_end_date')) {
            $query->where('due_date', '<=', $request->due_end_date);
        }

        $perPage = $request->input('per_page', 15);
        $invoices = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => InvoiceResource::collection($invoices->items()),
            'meta' => [
                'current_page' => $invoices->currentPage(),
                'last_page' => $invoices->lastPage(),
                'per_page' => $invoices->perPage(),
                'total' => $invoices->total(),
            ],
            'message' => 'Invoices retrieved successfully'
        ], 200);
    }

    /**
     * Get a single invoice
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $invoice = Invoice::with(['student.user', 'student.department', 'payments'])
            ->findOrFail($id);

        // Students can only view their own invoices
        if ($user->isStudent() && $user->student && $invoice->student_id !== $user->student->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'data' => new InvoiceResource($invoice),
            'message' => 'Invoice retrieved successfully'
        ], 200);
    }

    /**
     * Create a new invoice (admin/accountant only)
     */
    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        // Generate unique invoice ID
        $invoiceId = 'INV-' . date('Y') . '-' . str_pad(Invoice::count() + 1, 3, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'invoice_id' => $invoiceId,
            'student_id' => $request->student_id,
            'description' => $request->description,
            'amount' => $request->amount,
            'issue_date' => $request->issue_date,
            'due_date' => $request->due_date,
            'status' => $request->status ?? 'pending',
        ]);

        // Update status if overdue
        if (Carbon::parse($invoice->due_date)->isPast()) {
            $invoice->update(['status' => 'overdue']);
        }

        $invoice->load(['student.user', 'payments']);

        return response()->json([
            'data' => new InvoiceResource($invoice),
            'message' => 'Invoice created successfully'
        ], 201);
    }

    /**
     * Update invoice (admin/accountant only)
     */
    public function update(UpdateInvoiceRequest $request, $id): JsonResponse
    {
        $invoice = Invoice::findOrFail($id);
        
        $updateData = $request->only(['student_id', 'description', 'amount', 'issue_date', 'due_date', 'status']);
        
        $invoice->update($updateData);

        // Update status if overdue
        if (Carbon::parse($invoice->due_date)->isPast() && $invoice->status === 'pending') {
            $invoice->update(['status' => 'overdue']);
        }

        $invoice->load(['student.user', 'payments']);

        return response()->json([
            'data' => new InvoiceResource($invoice),
            'message' => 'Invoice updated successfully'
        ], 200);
    }

    /**
     * Delete invoice (admin/accountant only)
     */
    public function destroy($id): JsonResponse
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        return response()->json([
            'message' => 'Invoice deleted successfully'
        ], 200);
    }
}
