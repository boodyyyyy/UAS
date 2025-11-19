import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  roles?: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'grid' },
    { label: 'Student Fees', route: '/dashboard/student-fees', icon: 'document' },
    { label: 'Staff Payroll', route: '/dashboard/staff-payroll', icon: 'payroll', roles: [UserRole.ADMIN, UserRole.ACCOUNTING] },
    { label: 'Department Budget', route: '/dashboard/department-budget', icon: 'budget', roles: [UserRole.ADMIN, UserRole.ACCOUNTING] },
    { label: 'Profile', route: '/dashboard/profile', icon: 'user' }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get filteredMenuItems(): MenuItem[] {
    const user = this.currentUser;
    if (!user) return [];
    
    return this.menuItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(user.role);
    });
  }

  getRoleLabel(role?: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.ACCOUNTING:
        return 'Finance Department';
      case UserRole.STUDENT:
        return 'Student';
      default:
        return 'User';
    }
  }

  logout() {
    this.authService.logout();
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
