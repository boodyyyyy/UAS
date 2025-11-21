import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit, OnDestroy {
  isCollapsed = false;
  isHovered = false;
  currentUser: any = {};
  private userSubscription?: Subscription;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'grid' },
    { label: 'Student Fees', route: '/dashboard/student-fees', icon: 'document' },
    { label: 'Staff Payroll', route: '/dashboard/staff-payroll', icon: 'payroll' },
    { label: 'Department Budget', route: '/dashboard/department-budget', icon: 'budget' },
    { label: 'Profile', route: '/dashboard/profile', icon: 'user' }
  ];

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Initialize currentUser from service
    this.currentUser = this.userService.getUser();
    
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    // Update CSS variable for layout adjustment
    document.documentElement.style.setProperty('--sidebar-width', this.isCollapsed ? '80px' : '280px');
  }

  onMouseEnter() {
    if (this.isCollapsed) {
      this.isHovered = true;
    }
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  getRoleLabel(): string {
    const role = this.currentUser.role || 'student';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  logout() {
    // No-op for frontend-only version
    this.router.navigate(['/home']);
  }

  isActive(route: string): boolean {
    const currentUrl = this.router.url;
    
    // Exact match
    if (currentUrl === route) {
      return true;
    }
    
    // For dashboard route, only match if it's exactly /dashboard (not sub-routes)
    if (route === '/dashboard') {
      return currentUrl === '/dashboard';
    }
    
    // For other routes, check if current URL starts with the route
    // but ensure it's a proper sub-route (not just a prefix match)
    if (currentUrl.startsWith(route + '/')) {
      return true;
    }
    
    return false;
  }
}
