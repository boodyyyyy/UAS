export interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  grossPay: number;
  allowances: number;
  deductions: number;
  netPay: number;
  payPeriod: string;
  payDate: Date;
  createdAt: Date;
}

export interface PayrollReport {
  period: string;
  totalPayrollCost: number;
  employeesPaid: number;
  averageNetPay: number;
  payrolls: Payroll[];
}

