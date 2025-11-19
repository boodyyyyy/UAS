export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface BudgetTransaction {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'overdue';
}

export interface DepartmentBudget {
  id: string;
  department: string;
  fiscalYear: string;
  totalBudget: number;
  totalSpent: number;
  remainingBalance: number;
  variance: number;
  categories: BudgetCategory[];
  transactions: BudgetTransaction[];
}

