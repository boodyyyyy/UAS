import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Payroll } from '../../models/payroll.model';

@Component({
  selector: 'app-staff-payroll',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './staff-payroll.html',
  styleUrl: './staff-payroll.scss',
})
export class StaffPayroll implements OnInit {
  payrolls: Payroll[] = [];
  showCreateForm = false;
  payrollForm: FormGroup;
  showReport = false;
  reportData: any = null;

  constructor(
    private dataService: DataService,
    private fb: FormBuilder
  ) {
    this.payrollForm = this.fb.group({
      employeeId: ['', [Validators.required]],
      employeeName: ['', [Validators.required]],
      department: ['', [Validators.required]],
      grossPay: [0, [Validators.required, Validators.min(0)]],
      allowances: [0, [Validators.required, Validators.min(0)]],
      deductions: [0, [Validators.required, Validators.min(0)]],
      payPeriod: ['', [Validators.required]],
      payDate: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadPayrolls();
  }

  loadPayrolls() {
    this.dataService.getPayrolls().subscribe(payrolls => {
      this.payrolls = payrolls;
    });
  }

  createPayroll() {
    if (this.payrollForm.valid) {
      const formValue = this.payrollForm.value;
      const payrollData = {
        ...formValue,
        netPay: formValue.grossPay + formValue.allowances - formValue.deductions
      };
      
      this.dataService.createPayroll(payrollData).subscribe(() => {
        this.loadPayrolls();
        this.payrollForm.reset();
        this.showCreateForm = false;
      });
    }
  }

  getTotalCost(): number {
    return this.payrolls.reduce((sum, p) => sum + p.netPay, 0);
  }

  getAverageNetPay(): number {
    if (this.payrolls.length === 0) return 0;
    return this.getTotalCost() / this.payrolls.length;
  }

  generateReport() {
    const period = this.payrollForm.value.payPeriod || 'October 2024';
    this.dataService.generatePayrollReport(period).subscribe(report => {
      this.reportData = report;
      this.showReport = true;
      
      // Download as JSON
      const dataStr = JSON.stringify(report, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payroll-report-${period}.json`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }
}
