export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export interface Invoice {
  id: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  description: string;
  amount: number;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  createdAt: Date;
}

