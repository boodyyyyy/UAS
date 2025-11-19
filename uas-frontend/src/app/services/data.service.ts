import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Invoice, InvoiceStatus } from '../models/invoice.model';
import { Payment, PaymentMethod, PaymentStatus } from '../models/payment.model';
import { Payroll, PayrollReport } from '../models/payroll.model';
import { DepartmentBudget, BudgetTransaction } from '../models/budget.model';
import { StudentFee } from '../models/student-fee.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly INVOICES_KEY = 'uas_invoices';
  private readonly PAYMENTS_KEY = 'uas_payments';
  private readonly PAYROLL_KEY = 'uas_payroll';
  private readonly BUDGET_KEY = 'uas_budget';
  private readonly STUDENT_FEES_KEY = 'uas_student_fees';

  constructor(private storage: StorageService) {
    this.initializeData();
  }

  private initializeData(): void {
    // Initialize sample data if not exists
    if (!this.storage.getLocalStorage(this.INVOICES_KEY)) {
      const sampleInvoices: Invoice[] = [
        {
          id: '1',
          invoiceId: 'INV-2024-001',
          studentId: '3',
          studentName: 'Alex Johnson',
          description: 'Fall 2024 Tuition',
          amount: 12500,
          issueDate: new Date('2024-07-15'),
          dueDate: new Date('2024-08-15'),
          status: InvoiceStatus.PENDING,
          createdAt: new Date('2024-07-15')
        }
      ];
      this.storage.setLocalStorage(this.INVOICES_KEY, sampleInvoices);
    }

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

  // Invoice methods
  getInvoices(): Observable<Invoice[]> {
    const invoices = this.storage.getLocalStorage<Invoice[]>(this.INVOICES_KEY) || [];
    return of(invoices);
  }

  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>): Observable<Invoice> {
    const invoices = this.storage.getLocalStorage<Invoice[]>(this.INVOICES_KEY) || [];
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    invoices.push(newInvoice);
    this.storage.setLocalStorage(this.INVOICES_KEY, invoices);
    return of(newInvoice);
  }

  updateInvoiceStatus(id: string, status: InvoiceStatus): Observable<Invoice> {
    const invoices = this.storage.getLocalStorage<Invoice[]>(this.INVOICES_KEY) || [];
    const index = invoices.findIndex(i => i.id === id);
    if (index !== -1) {
      invoices[index].status = status;
      this.storage.setLocalStorage(this.INVOICES_KEY, invoices);
      return of(invoices[index]);
    }
    throw new Error('Invoice not found');
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

  // Student Fees methods
  getStudentFees(): Observable<StudentFee[]> {
    const fees = this.storage.getLocalStorage<StudentFee[]>(this.STUDENT_FEES_KEY) || [];
    return of(fees);
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

