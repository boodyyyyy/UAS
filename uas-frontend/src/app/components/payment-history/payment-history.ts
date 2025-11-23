import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-payment-history',
  imports: [CommonModule],
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.scss',
})
export class PaymentHistory implements OnInit {
  payments: any[] = [];
  currentUser: any = {};

  constructor(
    private dataService: DataService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getUser();
    this.loadPayments();
  }

  loadPayments() {
    // Load student fees and filter for paid ones
    this.dataService.getStudentFees().subscribe(fees => {
      // Filter for current student's paid fees
      this.payments = fees
        .filter(f => 
          (f.studentId === this.currentUser.id || f.studentName === this.currentUser.name) &&
          f.status === 'paid'
        )
        .map(fee => ({
          id: fee.id,
          description: fee.description,
          amount: fee.amount,
          date: fee.dueDate,
          status: fee.status
        }));
    });
  }
}

