<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\User;
use App\Models\Department;
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
        // Get student_id from either direct input or by looking up username
        $studentId = $request->student_id;
        
        if (!$studentId && $request->student_username) {
            // Trim whitespace from username
            $username = trim($request->student_username);
            
            if (empty($username)) {
                return response()->json([
                    'message' => 'Student username cannot be empty.'
                ], 422);
            }
            
            // Look up student by username (case-insensitive search)
            $user = User::whereRaw('LOWER(username) = ?', [strtolower($username)])
                ->where('role', 'student')
                ->first();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Student not found with username: "' . $username . '". Please check the username and try again.'
                ], 404);
            }
            
            // Load the student relationship
            $user->load('student');
            
            if (!$user->student) {
                // Auto-create student record if it doesn't exist
                // Get the first available department (or create a default one)
                $department = Department::first();
                
                if (!$department) {
                    // If no departments exist, create a default one
                    $department = Department::create([
                        'name' => 'General',
                        'code' => 'GEN',
                        'description' => 'General Department',
                    ]);
                }
                
                // Generate a unique student_id based on username and user ID
                $studentIdValue = 'STU-' . strtoupper(substr($username, 0, 3)) . '-' . str_pad($user->id, 4, '0', STR_PAD_LEFT);
                
                // Ensure uniqueness
                $counter = 1;
                while (Student::where('student_id', $studentIdValue)->exists()) {
                    $studentIdValue = 'STU-' . strtoupper(substr($username, 0, 3)) . '-' . str_pad($user->id, 4, '0', STR_PAD_LEFT) . '-' . $counter;
                    $counter++;
                }
                
                // Create the student record
                $student = Student::create([
                    'user_id' => $user->id,
                    'student_id' => $studentIdValue,
                    'department_id' => $department->id,
                    'status' => 'active',
                    'enrollment_date' => Carbon::now(),
                ]);
                
                // Refresh the user's student relationship
                $user->refresh();
                $user->load('student');
                
                $studentId = $student->id;
            } else {
                $studentId = $user->student->id;
            }
        }
        
        if (!$studentId) {
            return response()->json([
                'message' => 'Student ID or username is required.'
            ], 422);
        }

        // Generate unique invoice ID
        $invoiceId = 'INV-' . date('Y') . '-' . str_pad(Invoice::count() + 1, 3, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'invoice_id' => $invoiceId,
            'student_id' => $studentId,
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

    // ==================== DRAFT INVOICE METHODS (Server-Side Session) ====================
    // These methods demonstrate server-side session storage for milestone bonus requirement
    // Draft invoices are stored in Laravel session, NOT in database or localStorage

    /**
     * Save invoice draft to server-side session
     * This is for demonstrating server-side session usage (bonus requirement)
     * Draft is NOT saved to database - only stored in session
     */
    public function saveDraft(Request $request): JsonResponse
    {
        $request->validate([
            'draft' => 'required|array',
            'draft.student_id' => 'nullable|integer|exists:students,id',
            'draft.description' => 'nullable|string|max:255',
            'draft.amount' => 'nullable|numeric|min:0',
            'draft.issue_date' => 'nullable|date',
            'draft.due_date' => 'nullable|date',
            'draft.status' => 'nullable|string|in:pending,paid,overdue,cancelled',
        ]);

        // Store draft in server-side session
        session(['invoice_draft' => $request->draft]);

        return response()->json([
            'data' => $request->draft,
            'message' => 'Invoice draft saved to session successfully'
        ], 200);
    }

    /**
     * Retrieve invoice draft from server-side session
     * Returns the draft if it exists in the session
     */
    public function getDraft(Request $request): JsonResponse
    {
        $draft = session('invoice_draft', null);

        if ($draft === null) {
            return response()->json([
                'data' => null,
                'message' => 'No invoice draft found in session'
            ], 200);
        }

        return response()->json([
            'data' => $draft,
            'message' => 'Invoice draft retrieved from session successfully'
        ], 200);
    }

    /**
     * Clear invoice draft from server-side session
     * Called when invoice is finalized and saved to database
     */
    public function clearDraft(Request $request): JsonResponse
    {
        // Remove draft from session
        session()->forget('invoice_draft');

        return response()->json([
            'message' => 'Invoice draft cleared from session successfully'
        ], 200);
    }
}
