import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { DepartmentBudget as DepartmentBudgetModel, BudgetTransaction } from '../../models/budget.model';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-department-budget',
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective],
  templateUrl: './department-budget.html',
  styleUrl: './department-budget.scss',
})
export class DepartmentBudget implements OnInit {
  @ViewChild('budgetChart') budgetVsActualChart?: BaseChartDirective;
  @ViewChild('allocationChart') budgetAllocationChart?: BaseChartDirective;
  budget: DepartmentBudgetModel | null = null;
  showTransactionForm = false;
  transactionForm: FormGroup;
  chartData: any[] = [];

  // Budget vs Actual Spending Chart (Bar)
  public budgetVsActualChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Budgeted',
        data: [],
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
        borderWidth: 1
      },
      {
        label: 'Actual',
        data: [],
        backgroundColor: '#417C7E',
        borderColor: '#417C7E',
        borderWidth: 1
      }
    ]
  };
  public budgetVsActualChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y ?? 0;
            return `${context.dataset.label}: $${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + value.toLocaleString()
        }
      }
    }
  };

  // Budget Allocation Chart (Doughnut)
  public budgetAllocationChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#4A90E2',
        '#417C7E',
        '#2E8540',
        '#FFC107',
        '#D32F2F',
        '#9C27B0',
        '#FF9800',
        '#00BCD4'
      ],
      borderWidth: 0
    }]
  };
  public budgetAllocationChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

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
      // Update Budget vs Actual chart
      const categories = this.budget.categories.map(cat => cat.name);
      const budgeted = this.budget.categories.map(cat => cat.allocated);
      const actual = this.budget.categories.map(cat => cat.spent);
      
      // Create new references to trigger change detection
      this.budgetVsActualChartData = {
        ...this.budgetVsActualChartData,
        labels: [...categories],
        datasets: [
          {
            ...this.budgetVsActualChartData.datasets[0],
            data: [...budgeted]
          },
          {
            ...this.budgetVsActualChartData.datasets[1],
            data: [...actual]
          }
        ]
      };

      // Update Budget Allocation chart
      this.budgetAllocationChartData = {
        ...this.budgetAllocationChartData,
        labels: [...categories],
        datasets: [{
          ...this.budgetAllocationChartData.datasets[0],
          data: [...budgeted]
        }]
      };

      // Update charts
      setTimeout(() => {
        this.budgetVsActualChart?.update();
        this.budgetAllocationChart?.update();
      }, 0);
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
