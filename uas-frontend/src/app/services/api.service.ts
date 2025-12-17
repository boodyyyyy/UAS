import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Invoice, InvoiceStatus } from '../models/invoice.model';
import { Payment, PaymentStatus, PaymentMethod } from '../models/payment.model';
import { DepartmentBudget, BudgetTransaction } from '../models/budget.model';
import { Payroll, PayrollReport } from '../models/payroll.model';
import { StudentFee } from '../models/student-fee.model';
import { User } from '../models/user.model';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================== INVOICES ====================
  
  getInvoices(params?: {
    status?: InvoiceStatus;
    student_id?: number;
    start_date?: string;
    end_date?: string;
    due_start_date?: string;
    due_end_date?: string;
    page?: number;
    per_page?: number;
  }): Observable<PaginatedResponse<Invoice>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, String(params[key as keyof typeof params]));
        }
      });
    }
    return this.http.get<PaginatedResponse<Invoice>>(`${this.apiUrl}/invoices`, { params: httpParams });
  }

  getInvoice(id: number): Observable<{ data: Invoice; message: string }> {
    return this.http.get<{ data: Invoice; message: string }>(`${this.apiUrl}/invoices/${id}`);
  }

  createInvoice(invoice: {
    student_id: number;
    description: string;
    amount: number;
    issue_date: string;
    due_date: string;
    status?: InvoiceStatus;
  }): Observable<{ data: Invoice; message: string }> {
    return this.http.post<{ data: Invoice; message: string }>(`${this.apiUrl}/invoices`, invoice);
  }

  updateInvoice(id: number, invoice: Partial<Invoice>): Observable<{ data: Invoice; message: string }> {
    return this.http.patch<{ data: Invoice; message: string }>(`${this.apiUrl}/invoices/${id}`, invoice);
  }

  deleteInvoice(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/invoices/${id}`);
  }

  payInvoice(invoiceId: number, payment: {
    amount: number;
    method: PaymentMethod;
    payment_date?: string;
    description?: string;
  }): Observable<{ data: Payment; message: string }> {
    return this.http.post<{ data: Payment; message: string }>(`${this.apiUrl}/invoices/${invoiceId}/pay`, payment);
  }

  // ==================== PAYMENTS ====================
  
  getPayments(params?: {
    status?: PaymentStatus;
    invoice_id?: number;
    student_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  }): Observable<PaginatedResponse<Payment>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, String(params[key as keyof typeof params]));
        }
      });
    }
    return this.http.get<PaginatedResponse<Payment>>(`${this.apiUrl}/payments`, { params: httpParams });
  }

  getPayment(id: number): Observable<{ data: Payment; message: string }> {
    return this.http.get<{ data: Payment; message: string }>(`${this.apiUrl}/payments/${id}`);
  }

  createPayment(payment: {
    invoice_id: number;
    amount: number;
    method: PaymentMethod;
    payment_date: string;
    description?: string;
    status?: PaymentStatus;
  }): Observable<{ data: Payment; message: string }> {
    return this.http.post<{ data: Payment; message: string }>(`${this.apiUrl}/payments`, payment);
  }

  updatePaymentStatus(id: number, status: PaymentStatus): Observable<{ data: Payment; message: string }> {
    return this.http.patch<{ data: Payment; message: string }>(`${this.apiUrl}/payments/${id}/status`, { status });
  }

  // ==================== BUDGETS ====================
  
  getBudgets(params?: {
    department_id?: number;
    fiscal_year?: string;
    page?: number;
    per_page?: number;
  }): Observable<PaginatedResponse<DepartmentBudget>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, String(params[key as keyof typeof params]));
        }
      });
    }
    return this.http.get<PaginatedResponse<DepartmentBudget>>(`${this.apiUrl}/budgets`, { params: httpParams });
  }

  getBudget(id: number): Observable<{ data: DepartmentBudget; message: string }> {
    return this.http.get<{ data: DepartmentBudget; message: string }>(`${this.apiUrl}/budgets/${id}`);
  }

  createBudget(budget: {
    department_id: number;
    fiscal_year: string;
    total_budget: number;
    categories?: Array<{
      name: string;
      allocated: number;
      spent?: number;
    }>;
  }): Observable<{ data: DepartmentBudget; message: string }> {
    return this.http.post<{ data: DepartmentBudget; message: string }>(`${this.apiUrl}/budgets`, budget);
  }

  updateBudget(id: number, budget: Partial<DepartmentBudget>): Observable<{ data: DepartmentBudget; message: string }> {
    return this.http.patch<{ data: DepartmentBudget; message: string }>(`${this.apiUrl}/budgets/${id}`, budget);
  }

  addBudgetTransaction(transaction: {
    department_budget_id: number;
    budget_category_id?: number;
    transaction_date: string;
    description: string;
    category_name: string;
    amount: number;
    type: 'income' | 'expense';
    status?: 'completed' | 'pending' | 'overdue';
  }): Observable<{ data: BudgetTransaction; message: string }> {
    return this.http.post<{ data: BudgetTransaction; message: string }>(`${this.apiUrl}/budgets/transactions`, transaction);
  }

  // ==================== PAYROLLS ====================
  
  getPayrolls(params?: {
    staff_id?: number;
    pay_period?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  }): Observable<PaginatedResponse<Payroll>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, String(params[key as keyof typeof params]));
        }
      });
    }
    return this.http.get<PaginatedResponse<Payroll>>(`${this.apiUrl}/payrolls`, { params: httpParams });
  }

  getPayroll(id: number): Observable<{ data: Payroll; message: string }> {
    return this.http.get<{ data: Payroll; message: string }>(`${this.apiUrl}/payrolls/${id}`);
  }

  createPayroll(payroll: {
    staff_id: number;
    gross_pay: number;
    allowances?: number;
    deductions?: number;
    pay_period: string;
    pay_date: string;
  }): Observable<{ data: Payroll; message: string }> {
    return this.http.post<{ data: Payroll; message: string }>(`${this.apiUrl}/payrolls`, payroll);
  }

  generatePayrollReport(period: string): Observable<{ data: PayrollReport; message: string }> {
    return this.http.post<{ data: PayrollReport; message: string }>(`${this.apiUrl}/payrolls/report`, { period });
  }

  // ==================== STUDENT FEES ====================
  
  getStudentFees(params?: {
    status?: 'pending' | 'paid' | 'overdue';
    page?: number;
    per_page?: number;
  }): Observable<PaginatedResponse<StudentFee>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, String(params[key as keyof typeof params]));
        }
      });
    }
    return this.http.get<PaginatedResponse<StudentFee>>(`${this.apiUrl}/student-fees`, { params: httpParams });
  }

  createStudentFee(fee: {
    student_id: number;
    description: string;
    amount: number;
    due_date: string;
  }): Observable<{ data: StudentFee; message: string }> {
    return this.http.post<{ data: StudentFee; message: string }>(`${this.apiUrl}/student-fees`, fee);
  }

  updateStudentFeeStatus(id: number, status: 'pending' | 'paid' | 'overdue', paymentDate?: string): Observable<{ data: StudentFee; message: string }> {
    return this.http.patch<{ data: StudentFee; message: string }>(`${this.apiUrl}/student-fees/${id}/status`, {
      status,
      payment_date: paymentDate
    });
  }

  // ==================== USERS ====================
  
  getUsers(params?: {
    role?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
    per_page?: number;
  }): Observable<PaginatedResponse<User>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, String(params[key as keyof typeof params]));
        }
      });
    }
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/users`, { params: httpParams });
  }

  getUser(id: number): Observable<{ data: User; message: string }> {
    return this.http.get<{ data: User; message: string }>(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: number, user: Partial<User>): Observable<{ data: User; message: string }> {
    return this.http.patch<{ data: User; message: string }>(`${this.apiUrl}/users/${id}`, user);
  }

  updatePassword(id: number, passwords: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/users/${id}/password`, passwords);
  }

  // ==================== DEPARTMENTS ====================
  
  getDepartments(params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Observable<PaginatedResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, String(params[key as keyof typeof params]));
        }
      });
    }
    return this.http.get<PaginatedResponse<any>>(`${this.apiUrl}/departments`, { params: httpParams });
  }

  // ==================== REPORTS ====================
  
  getFinancialSummary(params?: {
    start_date?: string;
    end_date?: string;
  }): Observable<{ data: any; message: string }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, String(params[key as keyof typeof params]));
        }
      });
    }
    return this.http.get<{ data: any; message: string }>(`${this.apiUrl}/reports/financial-summary`, { params: httpParams });
  }

  getDepartmentBudgetsReport(params?: {
    fiscal_year?: string;
  }): Observable<{ data: any; message: string }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, String(params[key as keyof typeof params]));
        }
      });
    }
    return this.http.get<{ data: any; message: string }>(`${this.apiUrl}/reports/department-budgets`, { params: httpParams });
  }
}

