import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  currentUser = this.authService.getCurrentUser();
  stats: any = {};

  constructor(
    public authService: AuthService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    if (this.currentUser?.role === UserRole.STUDENT) {
      this.dataService.getStudentFees().subscribe(fees => {
        this.stats.totalFees = fees.length;
        this.stats.pendingFees = fees.filter(f => f.status === 'pending').length;
        this.stats.totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
      });
    } else {
      this.dataService.getInvoices().subscribe(invoices => {
        this.stats.totalInvoices = invoices.length;
        this.stats.pendingInvoices = invoices.filter(i => i.status === 'pending').length;
      });
    }
  }
}
