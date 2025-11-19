export interface StudentFee {
  id: string;
  studentId: string;
  studentName: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: Date;
  createdAt: Date;
}

