import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { UserService } from '../../services/user.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  @ViewChild('progressChart') paymentProgressChart?: BaseChartDirective;
  @ViewChild('revenueChart') revenueTrendsChart?: BaseChartDirective;
  @ViewChild('statusChart') feeStatusChart?: BaseChartDirective;
  currentUser: any = {};
  stats: any = {};
  private userSubscription?: Subscription;

  // Payment Progress Chart (Doughnut)
  public paymentProgressChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Paid', 'Remaining'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#667eea', 'rgba(102, 126, 234, 0.15)'],
      borderWidth: 0
    }]
  };
  public paymentProgressChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
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

  // Revenue Trends Chart (Line)
  public revenueTrendsChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Revenue',
      data: [],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointBackgroundColor: '#667eea',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };
  public revenueTrendsChartOptions: ChartOptions<'line'> = {
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
            return `Revenue: $${value.toLocaleString()}`;
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

  // Fee Status Distribution Chart (Pie)
  public feeStatusChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Paid', 'Pending', 'Overdue'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#667eea', '#764ba2', '#ff6b6b'],
      borderWidth: 0
    }]
  };
  public feeStatusChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  constructor(
    private dataService: DataService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Initialize currentUser from service
    this.currentUser = this.userService.getUser();
    
    this.loadStats();
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadStats() {
    // Load all stats for display
    this.dataService.getStudentFees().subscribe(fees => {
      this.stats.totalFees = fees.length;
      this.stats.pendingFees = fees.filter(f => f.status === 'pending').length;
      this.stats.totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
      this.stats.paidAmount = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
      
      // Update payment progress chart with new reference
      const remaining = this.stats.totalAmount - this.stats.paidAmount;
      this.paymentProgressChartData = {
        ...this.paymentProgressChartData,
        datasets: [{
          ...this.paymentProgressChartData.datasets[0],
          data: [
            this.stats.paidAmount || 0,
            remaining > 0 ? remaining : 0
          ]
        }]
      };

      // Update fee status chart with new reference
      const paidCount = fees.filter(f => f.status === 'paid').length;
      const pendingCount = fees.filter(f => f.status === 'pending').length;
      const overdueCount = fees.filter(f => f.status === 'overdue').length;
      this.feeStatusChartData = {
        ...this.feeStatusChartData,
        datasets: [{
          ...this.feeStatusChartData.datasets[0],
          data: [paidCount, pendingCount, overdueCount]
        }]
      };

      // Update charts
      setTimeout(() => {
        this.paymentProgressChart?.update();
        this.feeStatusChart?.update();
      }, 0);
    });
    
    this.dataService.getInvoices().subscribe(invoices => {
      this.stats.totalInvoices = invoices.length;
      this.stats.pendingInvoices = invoices.filter(i => i.status === 'pending').length;
    });

    // Generate sample revenue trends data
    this.generateRevenueTrends();
  }

  generateRevenueTrends() {
    // Generate sample monthly revenue data
    const monthlyRevenue = [];
    for (let i = 0; i < 12; i++) {
      monthlyRevenue.push(Math.floor(Math.random() * 500000) + 100000);
    }
    this.revenueTrendsChartData.datasets[0].data = monthlyRevenue;
  }
}
