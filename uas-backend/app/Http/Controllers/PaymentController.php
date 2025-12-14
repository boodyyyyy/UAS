<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Get all payments (with role-based filtering and pagination)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Payment::with(['invoice', 'student.user']);

        // Students can only see their own payments
        if ($user->isStudent() && $user->student) {
            $query->where('student_id', $user->student->id);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by invoice_id if provided
        if ($request->has('invoice_id')) {
            $query->where('invoice_id', $request->invoice_id);
        }

        // Filter by student_id (for admin/accountant)
        if ($request->has('student_id') && !$user->isStudent()) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('payment_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('payment_date', '<=', $request->end_date);
        }

        $perPage = $request->input('per_page', 15);
        $payments = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => PaymentResource::collection($payments->items()),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
            'message' => 'Payments retrieved successfully'
        ], 200);
    }

    /**
     * Get a single payment
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $payment = Payment::with(['invoice', 'student.user'])->findOrFail($id);

        // Students can only view their own payments
        if ($user->isStudent() && $user->student && $payment->student_id !== $user->student->id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'data' => new PaymentResource($payment),
            'message' => 'Payment retrieved successfully'
        ], 200);
    }

    /**
     * Create a new payment (admin/accountant only, with transaction safety)
     */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $invoice = Invoice::findOrFail($request->invoice_id);
            
            // Check for overpayment
            $totalPaid = Payment::where('invoice_id', $invoice->id)
                ->where('status', 'completed')
                ->sum('amount');
            
            $remainingAmount = $invoice->amount - $totalPaid;
            
            if ($request->amount > $remainingAmount) {
                return response()->json([
                    'message' => 'Payment amount exceeds remaining invoice amount',
                    'errors' => [
                        'amount' => ['Maximum payment amount is ' . number_format($remainingAmount, 2)]
                    ]
                ], 422);
            }

            // Generate unique transaction ID
            $transactionId = 'TXN-' . date('Y') . '-' . strtoupper(Str::random(8));

            $payment = Payment::create([
                'transaction_id' => $transactionId,
                'invoice_id' => $request->invoice_id,
                'student_id' => $invoice->student_id,
                'amount' => $request->amount,
                'method' => $request->method,
                'status' => $request->status ?? 'pending',
                'payment_date' => $request->payment_date,
                'description' => $request->description ?? 'Payment for invoice ' . $invoice->invoice_id,
            ]);

            // If payment is completed, update invoice status
            if ($payment->status === 'completed') {
                $newTotalPaid = $totalPaid + $payment->amount;
                
                if ($newTotalPaid >= $invoice->amount) {
                    $invoice->update(['status' => 'paid']);
                } elseif ($invoice->status === 'paid') {
                    // Partial payment after full payment (refund scenario)
                    $invoice->update(['status' => 'pending']);
                }
            }

            $payment->load(['invoice', 'student.user']);

            return response()->json([
                'data' => new PaymentResource($payment),
                'message' => 'Payment created successfully'
            ], 201);
        });
    }

    /**
     * Student payment endpoint - pay an invoice
     */
    public function payInvoice(Request $request, $invoiceId): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isStudent() || !$user->student) {
            return response()->json([
                'message' => 'Only students can use this endpoint'
            ], 403);
        }

        $validator = $request->validate([
            'amount' => 'required|numeric|min:0',
            'method' => 'required|in:credit_card,debit_card,bank_transfer,ach_transfer',
            'payment_date' => 'nullable|date',
            'description' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($request, $invoiceId, $user, $validator) {
            $invoice = Invoice::findOrFail($invoiceId);

            // Verify invoice belongs to student
            if ($invoice->student_id !== $user->student->id) {
                return response()->json([
                    'message' => 'Unauthorized - Invoice does not belong to you'
                ], 403);
            }

            // Check for overpayment
            $totalPaid = Payment::where('invoice_id', $invoice->id)
                ->where('status', 'completed')
                ->sum('amount');
            
            $remainingAmount = $invoice->amount - $totalPaid;
            
            if ($validator['amount'] > $remainingAmount) {
                return response()->json([
                    'message' => 'Payment amount exceeds remaining invoice amount',
                    'errors' => [
                        'amount' => ['Maximum payment amount is ' . number_format($remainingAmount, 2)]
                    ]
                ], 422);
            }

            // Generate unique transaction ID
            $transactionId = 'TXN-' . date('Y') . '-' . strtoupper(Str::random(8));

            $payment = Payment::create([
                'transaction_id' => $transactionId,
                'invoice_id' => $invoice->id,
                'student_id' => $invoice->student_id,
                'amount' => $validator['amount'],
                'method' => $validator['method'],
                'status' => 'pending', // Student payments start as pending
                'payment_date' => $validator['payment_date'] ?? now(),
                'description' => $validator['description'] ?? 'Payment for invoice ' . $invoice->invoice_id,
            ]);

            $payment->load(['invoice', 'student.user']);

            return response()->json([
                'data' => new PaymentResource($payment),
                'message' => 'Payment request created successfully. Waiting for approval.'
            ], 201);
        });
    }

    /**
     * Update payment status (admin/accountant only)
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validator = $request->validate([
            'status' => 'required|in:pending,completed,failed,refunded',
        ]);

        return DB::transaction(function () use ($request, $id, $validator) {
            $payment = Payment::with('invoice')->findOrFail($id);
            $oldStatus = $payment->status;
            
            $payment->update(['status' => $validator['status']]);

            // If payment status changed to completed, update invoice
            if ($oldStatus !== 'completed' && $validator['status'] === 'completed') {
                $invoice = $payment->invoice;
                $totalPaid = Payment::where('invoice_id', $invoice->id)
                    ->where('status', 'completed')
                    ->sum('amount');
                
                if ($totalPaid >= $invoice->amount) {
                    $invoice->update(['status' => 'paid']);
                }
            }

            // If payment was refunded or failed, update invoice status
            if ($oldStatus === 'completed' && in_array($validator['status'], ['refunded', 'failed'])) {
                $invoice = $payment->invoice;
                $totalPaid = Payment::where('invoice_id', $invoice->id)
                    ->where('status', 'completed')
                    ->sum('amount');
                
                if ($totalPaid < $invoice->amount) {
                    $invoice->update(['status' => 'pending']);
                }
            }

            $payment->load(['invoice', 'student.user']);

            return response()->json([
                'data' => new PaymentResource($payment),
                'message' => 'Payment status updated successfully'
            ], 200);
        });
    }
}
