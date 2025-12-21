<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Department;
use App\Models\Student;
use App\Models\Staff;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\DepartmentBudget;
use App\Models\BudgetCategory;
use App\Models\BudgetTransaction;
use App\Models\Payroll;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Departments
        $csDept = Department::create([
            'name' => 'Computer Science',
            'code' => 'CS',
            'description' => 'Department of Computer Science',
        ]);

        $mathDept = Department::create([
            'name' => 'Mathematics',
            'code' => 'MATH',
            'description' => 'Department of Mathematics',
        ]);

        $engDept = Department::create([
            'name' => 'Engineering',
            'code' => 'ENG',
            'description' => 'Department of Engineering',
        ]);

        // Create Users
        $admin = User::create([
            'username' => 'admin',
            'name' => 'Admin User',
            'email' => 'admin@uas.edu',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $accountant = User::create([
            'username' => 'accountant',
            'name' => 'Accountant User',
            'email' => 'accountant@uas.edu',
            'password' => Hash::make('password'),
            'role' => 'accounting',
            'is_active' => true,
        ]);

        $studentUser = User::create([
            'username' => 'student',
            'name' => 'John Doe',
            'email' => 'student@uas.edu',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
        ]);

        // Create Student
        $student = Student::create([
            'user_id' => $studentUser->id,
            'student_id' => 'STU001',
            'department_id' => $csDept->id,
            'phone' => '123-456-7890',
            'date_of_birth' => '2000-01-15',
            'address' => '123 University Ave',
            'status' => 'active',
            'enrollment_date' => '2023-09-01',
        ]);

        // Create Staff
        $staffUser = User::create([
            'username' => 'staff1',
            'name' => 'Jane Smith',
            'email' => 'staff1@uas.edu',
            'password' => Hash::make('password'),
            'role' => 'accounting',
            'is_active' => true,
        ]);

        $staff = Staff::create([
            'user_id' => $staffUser->id,
            'employee_id' => 'EMP001',
            'department_id' => $csDept->id,
            'phone' => '123-456-7891',
            'date_of_birth' => '1985-05-20',
            'address' => '456 Faculty St',
            'position' => 'Senior Lecturer',
            'salary' => 75000.00,
            'hire_date' => '2020-01-15',
            'status' => 'active',
        ]);

        // Create Invoices
        $invoice1 = Invoice::create([
            'invoice_id' => 'INV-2024-001',
            'student_id' => $student->id,
            'description' => 'Tuition Fee - Fall 2024',
            'amount' => 5000.00,
            'issue_date' => Carbon::now()->subDays(30),
            'due_date' => Carbon::now()->addDays(30),
            'status' => 'pending',
        ]);

        $invoice2 = Invoice::create([
            'invoice_id' => 'INV-2024-002',
            'student_id' => $student->id,
            'description' => 'Lab Fee - Fall 2024',
            'amount' => 500.00,
            'issue_date' => Carbon::now()->subDays(20),
            'due_date' => Carbon::now()->addDays(10),
            'status' => 'pending',
        ]);

        $invoice3 = Invoice::create([
            'invoice_id' => 'INV-2024-003',
            'student_id' => $student->id,
            'description' => 'Library Fee - Fall 2024',
            'amount' => 200.00,
            'issue_date' => Carbon::now()->subDays(60),
            'due_date' => Carbon::now()->subDays(30),
            'status' => 'overdue',
        ]);

        $invoice4 = Invoice::create([
            'invoice_id' => 'INV-2024-004',
            'student_id' => $student->id,
            'description' => 'Tuition Fee - Spring 2024',
            'amount' => 4500.00,
            'issue_date' => Carbon::now()->subDays(90),
            'due_date' => Carbon::now()->subDays(60),
            'status' => 'paid',
        ]);

        // Create Payments
        $payment1 = Payment::create([
            'transaction_id' => 'TXN-2024-001',
            'invoice_id' => $invoice4->id,
            'student_id' => $student->id,
            'amount' => 4500.00,
            'method' => 'credit_card',
            'status' => 'completed',
            'payment_date' => Carbon::now()->subDays(70),
            'description' => 'Payment for Spring 2024 tuition',
        ]);

        $payment2 = Payment::create([
            'transaction_id' => 'TXN-2024-002',
            'invoice_id' => $invoice1->id,
            'student_id' => $student->id,
            'amount' => 2500.00,
            'method' => 'bank_transfer',
            'status' => 'pending',
            'payment_date' => Carbon::now(),
            'description' => 'Partial payment for Fall 2024 tuition',
        ]);

        // Create Department Budgets
        $csBudget = DepartmentBudget::create([
            'department_id' => $csDept->id,
            'fiscal_year' => '2024',
            'total_budget' => 500000.00,
            'total_spent' => 325000.00,
            'remaining_balance' => 175000.00,
            'variance' => 0.00,
        ]);

        $mathBudget = DepartmentBudget::create([
            'department_id' => $mathDept->id,
            'fiscal_year' => '2024',
            'total_budget' => 300000.00,
            'total_spent' => 180000.00,
            'remaining_balance' => 120000.00,
            'variance' => 0.00,
        ]);

        $engBudget = DepartmentBudget::create([
            'department_id' => $engDept->id,
            'fiscal_year' => '2024',
            'total_budget' => 600000.00,
            'total_spent' => 450000.00,
            'remaining_balance' => 150000.00,
            'variance' => 0.00,
        ]);

        // Create Budget Categories for CS Department
        $csCategory1 = BudgetCategory::create([
            'department_budget_id' => $csBudget->id,
            'name' => 'Salaries',
            'allocated' => 300000.00,
            'spent' => 250000.00,
            'remaining' => 50000.00,
            'percentage' => 60.00,
        ]);

        $csCategory2 = BudgetCategory::create([
            'department_budget_id' => $csBudget->id,
            'name' => 'Equipment',
            'allocated' => 100000.00,
            'spent' => 50000.00,
            'remaining' => 50000.00,
            'percentage' => 20.00,
        ]);

        $csCategory3 = BudgetCategory::create([
            'department_budget_id' => $csBudget->id,
            'name' => 'Research',
            'allocated' => 75000.00,
            'spent' => 20000.00,
            'remaining' => 55000.00,
            'percentage' => 15.00,
        ]);

        $csCategory4 = BudgetCategory::create([
            'department_budget_id' => $csBudget->id,
            'name' => 'Maintenance',
            'allocated' => 25000.00,
            'spent' => 5000.00,
            'remaining' => 20000.00,
            'percentage' => 5.00,
        ]);

        // Create Budget Transactions
        BudgetTransaction::create([
            'department_budget_id' => $csBudget->id,
            'budget_category_id' => $csCategory1->id,
            'transaction_date' => Carbon::now()->subDays(10),
            'description' => 'Monthly salary payment',
            'category_name' => 'Salaries',
            'amount' => 50000.00,
            'type' => 'expense',
            'status' => 'completed',
        ]);

        BudgetTransaction::create([
            'department_budget_id' => $csBudget->id,
            'budget_category_id' => $csCategory2->id,
            'transaction_date' => Carbon::now()->subDays(5),
            'description' => 'New computer equipment purchase',
            'category_name' => 'Equipment',
            'amount' => 15000.00,
            'type' => 'expense',
            'status' => 'completed',
        ]);

        BudgetTransaction::create([
            'department_budget_id' => $csBudget->id,
            'budget_category_id' => $csCategory3->id,
            'transaction_date' => Carbon::now()->subDays(20),
            'description' => 'Research grant income',
            'category_name' => 'Research',
            'amount' => 10000.00,
            'type' => 'income',
            'status' => 'completed',
        ]);

        BudgetTransaction::create([
            'department_budget_id' => $mathBudget->id,
            'budget_category_id' => null,
            'transaction_date' => Carbon::now()->subDays(15),
            'description' => 'Textbook purchase',
            'category_name' => 'Supplies',
            'amount' => 5000.00,
            'type' => 'expense',
            'status' => 'pending',
        ]);

        // Create Payrolls
        Payroll::create([
            'staff_id' => $staff->id,
            'gross_pay' => 6250.00,
            'allowances' => 500.00,
            'deductions' => 1200.00,
            'net_pay' => 5550.00,
            'pay_period' => 'October 2024',
            'pay_date' => Carbon::now()->subDays(5),
        ]);

        Payroll::create([
            'staff_id' => $staff->id,
            'gross_pay' => 6250.00,
            'allowances' => 500.00,
            'deductions' => 1200.00,
            'net_pay' => 5550.00,
            'pay_period' => 'September 2024',
            'pay_date' => Carbon::now()->subDays(35),
        ]);

        $this->command->info('Demo data seeded successfully!');
        $this->command->info('Admin: admin@uas.edu / password');
        $this->command->info('Accountant: accountant@uas.edu / password');
        $this->command->info('Student: student@uas.edu / password');
    }
}

