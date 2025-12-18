import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ApiService } from '../../services/api.service';
import { UserService } from '../../services/user.service';
import { UserRole } from '../../models/user.model';
import { InvoiceStatus } from '../../models/invoice.model';
import { StudentFee } from '../../models/student-fee.model';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-student-fees',
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective],
  templateUrl: './student-fees.html',
  styleUrl: './student-fees.scss',
})
export class StudentFees implements OnInit {
  @ViewChild(BaseChartDirective) paymentStatusChart?: BaseChartDirective;
  @ViewChild('trendsChart') paymentTrendsChart?: BaseChartDirective;
  
  fees: StudentFee[] = [];
  allFees: StudentFee[] = [];
  showCreateForm = false;
  feeForm: FormGroup;
  currentUser: any = {};
  userRole: UserRole = UserRole.STUDENT;
  successMessage: string = '';
  showSuccessMessage: boolean = false;
  
  get isStudent(): boolean {
    return this.userRole === UserRole.STUDENT;
  }
  
  get canCreateInvoice(): boolean {
    return this.userRole === UserRole.ACCOUNTING || this.userRole === UserRole.ADMIN;
  }

  // Payment Status Chart (Pie)
  public paymentStatusChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Paid', 'Pending', 'Overdue'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#2E8540', '#FFC107', '#D32F2F'],
      borderWidth: 0
    }]
  };
  public paymentStatusChartOptions: ChartOptions<'pie'> = {
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

  // Payment Trends Chart (Line)
  public paymentTrendsChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Total Fees',
        data: [],
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Paid',
        data: [],
        borderColor: '#2E8540',
        backgroundColor: 'rgba(46, 133, 64, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Overdue',
        data: [],
        borderColor: '#D32F2F',
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  public paymentTrendsChartOptions: ChartOptions<'line'> = {
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

  constructor(
    private dataService: DataService,
    private apiService: ApiService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.feeForm = this.fb.group({
      studentUsername: ['', [Validators.required]], // Changed from studentId to username
      description: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      dueDate: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.currentUser = this.userService.getUser();
    this.userRole = this.currentUser?.role || UserRole.STUDENT;
    this.loadFees();
  }

  loadFees() {
    this.dataService.getStudentFees().subscribe(fees => {
      // Check and update any fees that have become overdue
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      
      const feesToUpdate: { id: string }[] = [];
      
      fees.forEach(fee => {
        const dueDate = new Date(fee.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        // If fee is pending and due date has passed, mark as overdue
        if (fee.status === 'pending' && dueDate < today) {
          feesToUpdate.push({ id: fee.id });
        }
      });
      
      // If there are fees to update, update them all
      if (feesToUpdate.length > 0) {
        const updateObservables = feesToUpdate.map(fee => 
          this.dataService.updateStudentFeeStatus(fee.id, 'overdue')
        );
        
        forkJoin(updateObservables).pipe(
          switchMap(() => this.dataService.getStudentFees())
        ).subscribe(updatedFees => {
          this.allFees = updatedFees;
          this.filterFeesByRole();
        });
      } else {
        // No updates needed, just set fees and filter by role
        this.allFees = fees;
        this.filterFeesByRole();
      }
    });
  }

  filterFeesByRole() {
    if (this.isStudent) {
      // Students only see their own fees
      const currentId = String(this.currentUser.id).trim();
      const currentName = this.currentUser.name.trim().toLowerCase();

      this.fees = this.allFees.filter(f => {
        return String(f.studentId).trim() === currentId ||
              f.studentName.trim().toLowerCase() === currentName;
      });

    } else {
      // Accounting + Admin see all fees
      this.fees = this.allFees;
    }

    this.updateCharts();

    //For my info: 
    //User stored in localStorage
    //id = "1712335345345"

    //Fee stored in student-fee list
    //studentId = 1712335345345 (number)
  }

  updateCharts() {
    // Update payment status chart
    const paidCount = this.fees.filter(f => f.status === 'paid').length;
    const pendingCount = this.fees.filter(f => f.status === 'pending').length;
    const overdueCount = this.fees.filter(f => f.status === 'overdue').length;
    
    // Create new array reference to trigger change detection
    this.paymentStatusChartData = {
      ...this.paymentStatusChartData,
      datasets: [{
        ...this.paymentStatusChartData.datasets[0],
        data: [paidCount, pendingCount, overdueCount]
      }]
    };

    // Update payment trends based on actual fee data
    const totalFees = [];
    const paidAmounts = [];
    const overdueAmounts = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const monthFees = this.fees.filter(f => {
        const feeDate = new Date(f.dueDate);
        return feeDate.getMonth() === monthDate.getMonth() && 
               feeDate.getFullYear() === monthDate.getFullYear();
      });
      totalFees.push(monthFees.reduce((sum, f) => sum + f.amount, 0));
      paidAmounts.push(monthFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0));
      overdueAmounts.push(monthFees.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0));
    }
    
    this.paymentTrendsChartData = {
      ...this.paymentTrendsChartData,
      datasets: [
        {
          ...this.paymentTrendsChartData.datasets[0],
          data: totalFees
        },
        {
          ...this.paymentTrendsChartData.datasets[1],
          data: paidAmounts
        },
        {
          ...this.paymentTrendsChartData.datasets[2],
          data: overdueAmounts
        }
      ]
    };

    // Update charts
    setTimeout(() => {
      this.paymentStatusChart?.update();
      this.paymentTrendsChart?.update();
    }, 0);
  }

  createFee() {
    if (this.feeForm.valid) {
      const dueDate = new Date(this.feeForm.value.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      dueDate.setHours(0, 0, 0, 0);
      
      // Determine status based on due date
      // If due date is in the past, mark as overdue, otherwise pending
      const status = dueDate < today ? InvoiceStatus.OVERDUE : InvoiceStatus.PENDING;
      
      // Create invoice using API with username instead of student ID
      const invoiceData = {
        student_username: this.feeForm.value.studentUsername,
        description: this.feeForm.value.description,
        amount: this.feeForm.value.amount,
        issue_date: today.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        status: status
      };
      
      this.apiService.createInvoice(invoiceData).subscribe({
        next: (response) => {
          // Show success message
          this.successMessage = `Invoice created successfully for student "${this.feeForm.value.studentUsername}"!`;
          this.showSuccessMessage = true;
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            this.showSuccessMessage = false;
            this.successMessage = '';
          }, 5000);
          
          // Reload fees and reset form
          this.loadFees();
          this.feeForm.reset();
          this.showCreateForm = false;
          // Charts will update automatically via loadFees -> updateCharts
        },
        error: (error) => {
          console.error('Error creating invoice:', error);
          alert(error.error?.message || 'Failed to create invoice');
        }
      });
    }
  }

  markAsPaid(fee: StudentFee) {
    this.dataService.updateStudentFeeStatus(fee.id, 'paid', new Date()).subscribe(() => {
      this.loadFees();
      // Charts will update automatically via loadFees -> updateCharts
    });
  }
}
