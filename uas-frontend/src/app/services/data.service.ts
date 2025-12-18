import { Injectable } from '@angular/core';
import { Observable, of, tap, catchError, throwError, map } from 'rxjs';
import { Invoice, InvoiceStatus } from '../models/invoice.model';
import { Payment, PaymentMethod, PaymentStatus } from '../models/payment.model';
import { Payroll, PayrollReport } from '../models/payroll.model';
import { DepartmentBudget, BudgetTransaction } from '../models/budget.model';
import { StudentFee } from '../models/student-fee.model';
import { StorageService } from './storage.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly INVOICES_KEY = 'uas_invoices';
  private readonly PAYMENTS_KEY = 'uas_payments';
  private readonly PAYROLL_KEY = 'uas_payroll';
  private readonly BUDGET_KEY = 'uas_budget';
  private readonly STUDENT_FEES_KEY = 'uas_student_fees';

  constructor(
    private storage: StorageService,
    private apiService: ApiService
  ) {
    this.initializeData();
  }

  private initializeData(): void {
    // Invoices are now stored server-side in database, not localStorage
    // No need to initialize sample data in localStorage

    if (!this.storage.getLocalStorage(this.PAYMENTS_KEY)) {
      this.storage.setLocalStorage(this.PAYMENTS_KEY, []);
    }

    if (!this.storage.getLocalStorage(this.PAYROLL_KEY)) {
      const samplePayroll: Payroll[] = [
        {
          id: '1',
          employeeId: 'EMP-00123',
          employeeName: 'Johnathan Smith',
          department: 'Computer Science',
          grossPay: 6200,
          allowances: 500,
          deductions: 1450,
          netPay: 4750,
          payPeriod: 'October 2024',
          payDate: new Date('2024-10-15'),
          createdAt: new Date()
        }
      ];
      this.storage.setLocalStorage(this.PAYROLL_KEY, samplePayroll);
    }

    if (!this.storage.getLocalStorage(this.BUDGET_KEY)) {
      const sampleBudget: DepartmentBudget = {
        id: '1',
        department: 'All',
        fiscalYear: 'FY2024',
        totalBudget: 2500000,
        totalSpent: 1875000,
        remainingBalance: 625000,
        variance: 2.5,
        categories: [
          { id: '1', name: 'Salaries', allocated: 1000000, spent: 750000, remaining: 250000, percentage: 75 },
          { id: '2', name: 'Supplies', allocated: 500000, spent: 375000, remaining: 125000, percentage: 75 },
          { id: '3', name: 'Utilities', allocated: 300000, spent: 250000, remaining: 50000, percentage: 83 },
          { id: '4', name: 'Travel', allocated: 200000, spent: 150000, remaining: 50000, percentage: 75 },
          { id: '5', name: 'Other', allocated: 500000, spent: 350000, remaining: 150000, percentage: 70 }
        ],
        transactions: []
      };
      this.storage.setLocalStorage(this.BUDGET_KEY, sampleBudget);
    }

    if (!this.storage.getLocalStorage(this.STUDENT_FEES_KEY)) {
      this.storage.setLocalStorage(this.STUDENT_FEES_KEY, []);
    }
  }

  // Invoice methods - Now using server-side database (no localStorage)
  getInvoices(): Observable<Invoice[]> {
    // Use database API - server-side storage only
    return this.apiService.getInvoices().pipe(
      map(response => response.data), // Transform paginated response to Invoice[]
      catchError(error => {
        console.error('Failed to get invoices from server', error);
        return throwError(() => error);
      })
    );
  }

  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Observable<Invoice> {
    // Use database API - server-side storage only
    return this.apiService.createInvoice({
      student_id: parseInt(invoice.studentId),
      description: invoice.description,
      amount: invoice.amount,
      issue_date: invoice.issueDate.toISOString().split('T')[0],
      due_date: invoice.dueDate.toISOString().split('T')[0],
      status: invoice.status
    }).pipe(
      map(response => {
        // InvoiceResource already returns camelCase format matching Invoice interface
        const dbInvoice = response.data;
        return {
          id: String(dbInvoice.id),
          invoiceId: dbInvoice.invoiceId,
          studentId: String(dbInvoice.studentId),
          studentName: dbInvoice.studentName || '',
          description: dbInvoice.description,
          amount: dbInvoice.amount,
          issueDate: new Date(dbInvoice.issueDate),
          dueDate: new Date(dbInvoice.dueDate),
          status: dbInvoice.status as InvoiceStatus,
          createdAt: new Date(dbInvoice.createdAt)
        };
      }),
      catchError(error => {
        console.error('Failed to create invoice on server', error);
        return throwError(() => error);
      })
    );
  }

  updateInvoiceStatus(id: string, status: InvoiceStatus): Observable<Invoice> {
    // Use database API - server-side storage only
    return this.apiService.updateInvoice(parseInt(id), { status }).pipe(
      map(response => {
        // InvoiceResource already returns camelCase format matching Invoice interface
        const dbInvoice = response.data;
        return {
          id: String(dbInvoice.id),
          invoiceId: dbInvoice.invoiceId,
          studentId: String(dbInvoice.studentId),
          studentName: dbInvoice.studentName || '',
          description: dbInvoice.description,
          amount: dbInvoice.amount,
          issueDate: new Date(dbInvoice.issueDate),
          dueDate: new Date(dbInvoice.dueDate),
          status: dbInvoice.status as InvoiceStatus,
          createdAt: new Date(dbInvoice.createdAt)
        };
      }),
      catchError(error => {
        console.error('Failed to update invoice on server', error);
        return throwError(() => error);
      })
    );
  }

  // ==================== DRAFT INVOICE METHODS (Server-Side Session) ====================
  // These methods use server-side session storage (bonus requirement)
  // Drafts are NOT stored in localStorage - only in server session

  /**
   * Save invoice draft to server-side session
   * This demonstrates server-side session usage for milestone bonus
   * Draft is NOT saved to database or localStorage
   */
  saveInvoiceDraft(draft: Partial<Invoice>): Observable<any> {
    return this.apiService.saveInvoiceDraft(draft).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Failed to save invoice draft to server session', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get invoice draft from server-side session
   * Returns null if no draft exists
   */
  getInvoiceDraft(): Observable<Partial<Invoice> | null> {
    return this.apiService.getInvoiceDraft().pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Failed to get invoice draft from server session', error);
        return of(null);
      })
    );
  }

  /**
   * Clear invoice draft from server-side session
   * Called when invoice is finalized and saved to database
   */
  clearInvoiceDraft(): Observable<void> {
    return this.apiService.clearInvoiceDraft().pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Failed to clear invoice draft from server session', error);
        return throwError(() => error);
      })
    );
  }

  // Payment methods
  getPayments(): Observable<Payment[]> {
    const payments = this.storage.getLocalStorage<Payment[]>(this.PAYMENTS_KEY) || [];
    return of(payments);
  }

  createPayment(payment: Omit<Payment, 'id' | 'transactionId' | 'createdAt'>): Observable<Payment> {
    const payments = this.storage.getLocalStorage<Payment[]>(this.PAYMENTS_KEY) || [];
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      transactionId: `TRN-${Date.now()}`,
      createdAt: new Date()
    };
    payments.push(newPayment);
    this.storage.setLocalStorage(this.PAYMENTS_KEY, payments);
    return of(newPayment);
  }

  // Payroll methods
  getPayrolls(): Observable<Payroll[]> {
    const payrolls = this.storage.getLocalStorage<Payroll[]>(this.PAYROLL_KEY) || [];
    return of(payrolls);
  }

  createPayroll(payroll: Omit<Payroll, 'id' | 'createdAt'>): Observable<Payroll> {
    const payrolls = this.storage.getLocalStorage<Payroll[]>(this.PAYROLL_KEY) || [];
    const newPayroll: Payroll = {
      ...payroll,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    payrolls.push(newPayroll);
    this.storage.setLocalStorage(this.PAYROLL_KEY, payrolls);
    return of(newPayroll);
  }

  generatePayrollReport(period: string): Observable<PayrollReport> {
    const payrolls = this.storage.getLocalStorage<Payroll[]>(this.PAYROLL_KEY) || [];
    const periodPayrolls = payrolls.filter(p => p.payPeriod === period);
    
    const report: PayrollReport = {
      period,
      totalPayrollCost: periodPayrolls.reduce((sum, p) => sum + p.netPay, 0),
      employeesPaid: periodPayrolls.length,
      averageNetPay: periodPayrolls.length > 0 
        ? periodPayrolls.reduce((sum, p) => sum + p.netPay, 0) / periodPayrolls.length 
        : 0,
      payrolls: periodPayrolls
    };
    
    return of(report);
  }

  // Budget methods
  getBudget(): Observable<DepartmentBudget> {
    const budget = this.storage.getLocalStorage<DepartmentBudget>(this.BUDGET_KEY);
    return of(budget || this.getDefaultBudget());
  }

  updateBudget(budget: DepartmentBudget): Observable<DepartmentBudget> {
    this.storage.setLocalStorage(this.BUDGET_KEY, budget);
    return of(budget);
  }

  addBudgetTransaction(transaction: Omit<BudgetTransaction, 'id'>): Observable<BudgetTransaction> {
    const budget = this.storage.getLocalStorage<DepartmentBudget>(this.BUDGET_KEY);
    if (budget) {
      const newTransaction: BudgetTransaction = {
        ...transaction,
        id: Date.now().toString()
      };
      budget.transactions.push(newTransaction);
      this.storage.setLocalStorage(this.BUDGET_KEY, budget);
      return of(newTransaction);
    }
    throw new Error('Budget not found');
  }

  private getDefaultBudget(): DepartmentBudget {
    return {
      id: '1',
      department: 'All',
      fiscalYear: 'FY2024',
      totalBudget: 2500000,
      totalSpent: 1875000,
      remainingBalance: 625000,
      variance: 2.5,
      categories: [],
      transactions: []
    };
  }

  // Student Fees methods - Using API for database-backed invoices
  getStudentFees(): Observable<StudentFee[]> {
    // Use API to get invoices from database (student-fees endpoint returns invoices)
    return this.apiService.getStudentFees().pipe(
      map(response => {
        // Transform Invoice[] to StudentFee[] format
        // The API returns invoices with camelCase properties from InvoiceResource
        return response.data.map((invoice: any) => ({
          id: invoice.id?.toString() || invoice.invoiceId || '',
          studentId: invoice.studentId?.toString() || '',
          studentName: invoice.studentName || '',
          description: invoice.description || '',
          amount: invoice.amount || 0,
          dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
          status: (invoice.status || 'pending') as 'pending' | 'paid' | 'overdue',
          createdAt: invoice.createdAt ? new Date(invoice.createdAt) : new Date()
        }));
      }),
      catchError(error => {
        console.error('Failed to get student fees from server', error);
        return throwError(() => error);
      })
    );
  }

  createStudentFee(fee: Omit<StudentFee, 'id' | 'createdAt'>): Observable<StudentFee> {
    const fees = this.storage.getLocalStorage<StudentFee[]>(this.STUDENT_FEES_KEY) || [];
    const newFee: StudentFee = {
      ...fee,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    fees.push(newFee);
    this.storage.setLocalStorage(this.STUDENT_FEES_KEY, fees);
    return of(newFee);
  }

  updateStudentFeeStatus(id: string, status: 'pending' | 'paid' | 'overdue', paymentDate?: Date): Observable<StudentFee> {
    const fees = this.storage.getLocalStorage<StudentFee[]>(this.STUDENT_FEES_KEY) || [];
    const index = fees.findIndex(f => f.id === id);
    if (index !== -1) {
      fees[index].status = status;
      if (paymentDate) {
        fees[index].paymentDate = paymentDate;
      }
      this.storage.setLocalStorage(this.STUDENT_FEES_KEY, fees);
      return of(fees[index]);
    }
    throw new Error('Student fee not found');
  }
}

