import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserRole } from '../../models/user.model';
import { Subscription } from 'rxjs';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  roles?: UserRole[]; // If undefined, accessible to all roles
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit, OnDestroy {
  isCollapsed = false;
  isHovered = false;
  currentUser: any = {};
  menuItems: MenuItem[] = [];
  private userSubscription?: Subscription;

  // All possible menu items
  private allMenuItems: MenuItem[] = [
    // Student menu items
    { label: 'Dashboard', route: '/dashboard', icon: 'grid', roles: [UserRole.STUDENT, UserRole.ACCOUNTING, UserRole.ADMIN] },
    { label: 'My Fees', route: '/dashboard/student-fees', icon: 'document', roles: [UserRole.STUDENT] },
    { label: 'Payment History', route: '/dashboard/payment-history', icon: 'history', roles: [UserRole.STUDENT] },
    
    // Accounting menu items
    { label: 'Invoices', route: '/dashboard/student-fees', icon: 'document', roles: [UserRole.ACCOUNTING, UserRole.ADMIN] },
    { label: 'Staff Payroll', route: '/dashboard/staff-payroll', icon: 'payroll', roles: [UserRole.ACCOUNTING, UserRole.ADMIN] },
    { label: 'Payments', route: '/dashboard/payments', icon: 'payment', roles: [UserRole.ACCOUNTING, UserRole.ADMIN] },
    { label: 'Department Budget', route: '/dashboard/department-budget', icon: 'budget', roles: [UserRole.ACCOUNTING, UserRole.ADMIN] },
    { label: 'Reports', route: '/dashboard/reports', icon: 'chart', roles: [UserRole.ACCOUNTING, UserRole.ADMIN] },
    
    
    // Admin menu items
    { label: 'User Management', route: '/dashboard/user-management', icon: 'users', roles: [UserRole.ADMIN] },
    { label: 'System Settings', route: '/dashboard/settings', icon: 'settings', roles: [UserRole.ADMIN] },
    
    // Shared menu items
    { label: 'Profile', route: '/dashboard/profile', icon: 'user' }
  ];

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Initialize currentUser from service
    this.currentUser = this.userService.getUser();
    this.updateMenuItems();
    
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.currentUser = user;
      this.updateMenuItems();
    });
  }

  updateMenuItems() {
    const userRole = this.currentUser?.role;
    if (!userRole) {
      this.menuItems = [];
      return;
    }

    // Filter menu items based on user role
    this.menuItems = this.allMenuItems.filter(item => {
      // If no roles specified, item is accessible to all
      if (!item.roles) return true;
      // Admin can access everything
      if (userRole === UserRole.ADMIN) return true;
      // Check if user role is in the allowed roles
      return item.roles.includes(userRole);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    // Clear hover state when toggling
    if (!this.isCollapsed) {
      this.isHovered = false;
    }
    // Update CSS variable for layout adjustment
    document.documentElement.style.setProperty('--sidebar-width', this.isCollapsed ? '80px' : '280px');
  }

  onMouseEnter() {
    // Only show hover expansion when collapsed
    if (this.isCollapsed) {
      this.isHovered = true;
    }
  }

  onMouseLeave() {
    // Always clear hover state on mouse leave
    this.isHovered = false;
  }

  getRoleLabel(): string {
    const role = this.currentUser.role || 'student';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  logout() {
    // Get user ID before clearing session
    const userId = this.currentUser.id;
    
    // Clear session storage
    sessionStorage.removeItem('currentUserId');
    
    // Clear user-specific profile picture from localStorage
    if (userId) {
      localStorage.removeItem(`profile_picture_${userId}`);
    }
    
    // Clear theme cookie (optional - if you want theme to persist, remove this)
    // document.cookie = "theme=; Max-Age=0; path=/;";
    
    // Clear user from service
    this.userService.setUser(null as any);
    
    // Navigate to login
    this.router.navigate(['/login']);
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