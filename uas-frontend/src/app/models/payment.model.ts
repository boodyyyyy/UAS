export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  ACH_TRANSFER = 'ach_transfer'
}

export interface Payment {
  id: string;
  transactionId: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: Date;
  description: string;
  createdAt: Date;
}

