import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-reports',
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  reports: any = {};

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.dataService.getStudentFees().subscribe(fees => {
      this.reports.totalFees = fees.length;
      this.reports.totalRevenue = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
      this.reports.pendingRevenue = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
      this.reports.overdueRevenue = fees.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);
    });

    this.dataService.getBudget().subscribe(budget => {
      this.reports.totalBudget = budget?.totalBudget || 0;
      this.reports.totalSpent = budget?.transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      this.reports.remainingBudget = this.reports.totalBudget - this.reports.totalSpent;
    });
  }

  exportReport() {
    alert('Report export functionality would be implemented here.');
  }
}

