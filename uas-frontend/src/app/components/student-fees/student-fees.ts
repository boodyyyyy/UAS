import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { StudentFee } from '../../models/student-fee.model';

@Component({
  selector: 'app-student-fees',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-fees.html',
  styleUrl: './student-fees.scss',
})
export class StudentFees implements OnInit {
  fees: StudentFee[] = [];
  showCreateForm = false;
  feeForm: FormGroup;
  currentUser = this.authService.getCurrentUser();

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.feeForm = this.fb.group({
      studentId: ['', [Validators.required]],
      studentName: ['', [Validators.required]],
      description: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      dueDate: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadFees();
  }

  loadFees() {
    this.dataService.getStudentFees().subscribe(fees => {
      if (this.currentUser?.role === 'student') {
        this.fees = fees.filter(f => f.studentId === this.currentUser?.id);
      } else {
        this.fees = fees;
      }
    });
  }

  createFee() {
    if (this.feeForm.valid) {
      const feeData = {
        ...this.feeForm.value,
        status: 'pending' as const,
        studentId: this.feeForm.value.studentId || this.currentUser?.id || ''
      };
      
      this.dataService.createStudentFee(feeData).subscribe(() => {
        this.loadFees();
        this.feeForm.reset();
        this.showCreateForm = false;
      });
    }
  }

  markAsPaid(fee: StudentFee) {
    this.dataService.updateStudentFeeStatus(fee.id, 'paid', new Date()).subscribe(() => {
      this.loadFees();
    });
  }
}
