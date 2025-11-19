import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { DepartmentBudget, BudgetTransaction } from '../../models/budget.model';

@Component({
  selector: 'app-department-budget',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department-budget.html',
  styleUrl: './department-budget.scss',
})
export class DepartmentBudget implements OnInit {
  budget: DepartmentBudget | null = null;
  showTransactionForm = false;
  transactionForm: FormGroup;
  chartData: any[] = [];

  constructor(
    private dataService: DataService,
    private fb: FormBuilder
  ) {
    this.transactionForm = this.fb.group({
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      type: ['expense', [Validators.required]],
      date: [new Date().toISOString().split('T')[0], [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadBudget();
  }

  loadBudget() {
    this.dataService.getBudget().subscribe(budget => {
      this.budget = budget;
      this.updateChartData();
    });
  }

  updateChartData() {
    if (this.budget) {
      this.chartData = this.budget.categories.map(cat => ({
        name: cat.name,
        value: cat.spent,
        allocated: cat.allocated
      }));
    }
  }

  addTransaction() {
    if (this.transactionForm.valid && this.budget) {
      const transaction: Omit<BudgetTransaction, 'id'> = {
        ...this.transactionForm.value,
        date: new Date(this.transactionForm.value.date),
        status: 'completed'
      };
      
      this.dataService.addBudgetTransaction(transaction).subscribe(() => {
        this.loadBudget();
        this.transactionForm.reset();
        this.showTransactionForm = false;
      });
    }
  }
}
