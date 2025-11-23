import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-payments',
  imports: [CommonModule],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class Payments implements OnInit {
  payments: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.dataService.getStudentFees().subscribe(fees => {
      this.payments = fees
        .filter(f => f.status === 'paid')
        .map(fee => ({
          id: fee.id,
          studentName: fee.studentName,
          description: fee.description,
          amount: fee.amount,
          date: fee.dueDate,
          status: fee.status
        }));
    });
  }
}

