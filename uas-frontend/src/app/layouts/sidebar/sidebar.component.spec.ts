import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar';
import { UserService } from '../../services/user.service';
import { provideRouter, Router } from '@angular/router';
import { UserRole } from '../../models/user.model';
import { BehaviorSubject } from 'rxjs';

/**
 * SIDEBAR COMPONENT TEST SUITE
 * 
 * This test suite validates the sidebar functionality including:
 * - Component initialization and user subscription
 * - Role-based menu filtering (Student, Accounting, Admin)
 * - Sidebar collapse/expand functionality
 * - Active route detection and highlighting
 * - Logout functionality and session cleanup
 * - Dynamic menu updates when user changes
 */

describe('Sidebar Component', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let router: Router;
  let userSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    // Create a BehaviorSubject to simulate user$ observable
    userSubject = new BehaviorSubject({
      id: '1',
      username: 'testuser',
      name: 'Test User',
      role: UserRole.STUDENT,
      email: 'test@test.com',
      picture: ''
    });

    // Create spy with user$ observable
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUser', 'setUser'], {
      user$: userSubject.asObservable()
    });
    
    userServiceSpy.getUser.and.returnValue(userSubject.value);

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        provideRouter([
          { path: 'dashboard', children: [] },
          { path: 'dashboard/student-fees', children: [] },
          { path: 'dashboard/profile', children: [] },
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  // ==================== COMPONENT INITIALIZATION ====================

  it('should create the sidebar component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with user from service', () => {
    expect(component.currentUser).toBeTruthy();
    expect(component.currentUser.username).toBe('testuser');
  });

  it('should subscribe to user changes on init', () => {
    expect(component.currentUser.role).toBe(UserRole.STUDENT);
    
    // Emit new user
    const newUser = { ...userSubject.value, role: UserRole.ADMIN };
    userSubject.next(newUser);
    
    expect(component.currentUser.role).toBe(UserRole.ADMIN);
  });

  it('should unsubscribe on destroy', () => {
    const subscription = component['userSubscription'];
    spyOn(subscription!, 'unsubscribe');
    
    component.ngOnDestroy();
    
    expect(subscription!.unsubscribe).toHaveBeenCalled();
  });

  // ==================== ROLE-BASED MENU FILTERING ====================

  it('should show student-specific menu items for student role', () => {
    component.currentUser = { role: UserRole.STUDENT };
    component.updateMenuItems();

    const myFeesItem = component.menuItems.find(item => item.label === 'My Fees');
    const paymentHistoryItem = component.menuItems.find(item => item.label === 'Payment History');
    
    expect(myFeesItem).toBeTruthy();
    expect(paymentHistoryItem).toBeTruthy();
  });

  it('should NOT show accounting menu items for student role', () => {
    component.currentUser = { role: UserRole.STUDENT };
    component.updateMenuItems();

    const invoicesItem = component.menuItems.find(item => item.label === 'Invoices');
    const payrollItem = component.menuItems.find(item => item.label === 'Staff Payroll');
    
    expect(invoicesItem).toBeFalsy();
    expect(payrollItem).toBeFalsy();
  });

  it('should show accounting-specific menu items for accounting role', () => {
    component.currentUser = { role: UserRole.ACCOUNTING };
    component.updateMenuItems();

    const invoicesItem = component.menuItems.find(item => item.label === 'Invoices');
    const payrollItem = component.menuItems.find(item => item.label === 'Staff Payroll');
    const paymentsItem = component.menuItems.find(item => item.label === 'Payments');
    
    expect(invoicesItem).toBeTruthy();
    expect(payrollItem).toBeTruthy();
    expect(paymentsItem).toBeTruthy();
  });

  it('should NOT show student-specific menu items for accounting role', () => {
    component.currentUser = { role: UserRole.ACCOUNTING };
    component.updateMenuItems();

    const myFeesItem = component.menuItems.find(item => item.label === 'My Fees');
    const paymentHistoryItem = component.menuItems.find(item => item.label === 'Payment History');
    
    expect(myFeesItem).toBeFalsy();
    expect(paymentHistoryItem).toBeFalsy();
  });

  it('should show ALL menu items for admin role', () => {
    component.currentUser = { role: UserRole.ADMIN };
    component.updateMenuItems();

    // Admin sees everything
    const studentItem = component.menuItems.find(item => item.label === 'My Fees');
    const accountingItem = component.menuItems.find(item => item.label === 'Invoices');
    const adminItem = component.menuItems.find(item => item.label === 'User Management');
    
    expect(studentItem).toBeTruthy();
    expect(accountingItem).toBeTruthy();
    expect(adminItem).toBeTruthy();
  });

  it('should show shared menu items for all roles', () => {
    // Test for Student
    component.currentUser = { role: UserRole.STUDENT };
    component.updateMenuItems();
    expect(component.menuItems.find(item => item.label === 'Profile')).toBeTruthy();

    // Test for Accounting
    component.currentUser = { role: UserRole.ACCOUNTING };
    component.updateMenuItems();
    expect(component.menuItems.find(item => item.label === 'Profile')).toBeTruthy();

    // Test for Admin
    component.currentUser = { role: UserRole.ADMIN };
    component.updateMenuItems();
    expect(component.menuItems.find(item => item.label === 'Profile')).toBeTruthy();
  });

  it('should return empty menu when user has no role', () => {
    component.currentUser = { role: null };
    component.updateMenuItems();

    expect(component.menuItems.length).toBe(0);
  });

  // ==================== SIDEBAR TOGGLE FUNCTIONALITY ====================

  it('should toggle sidebar collapse state', () => {
    expect(component.isCollapsed).toBeFalse();
    
    component.toggleSidebar();
    expect(component.isCollapsed).toBeTrue();
    
    component.toggleSidebar();
    expect(component.isCollapsed).toBeFalse();
  });

  it('should update CSS variable when toggling sidebar', () => {
    const setPropertySpy = spyOn(document.documentElement.style, 'setProperty');
    
    component.toggleSidebar();
    expect(setPropertySpy).toHaveBeenCalledWith('--sidebar-width', '80px');
    
    component.toggleSidebar();
    expect(setPropertySpy).toHaveBeenCalledWith('--sidebar-width', '280px');
  });

  it('should set hover state on mouse enter when collapsed', () => {
    component.isCollapsed = true;
    component.isHovered = false;
    
    component.onMouseEnter();
    
    expect(component.isHovered).toBeTrue();
  });

  it('should NOT set hover state on mouse enter when NOT collapsed', () => {
    component.isCollapsed = false;
    component.isHovered = false;
    
    component.onMouseEnter();
    
    expect(component.isHovered).toBeFalse();
  });

  it('should clear hover state on mouse leave', () => {
    component.isHovered = true;
    
    component.onMouseLeave();
    
    expect(component.isHovered).toBeFalse();
  });

  // ==================== ROLE LABEL DISPLAY ====================

  it('should return capitalized role label', () => {
    component.currentUser = { role: UserRole.STUDENT };
    expect(component.getRoleLabel()).toBe('Student');

    component.currentUser = { role: UserRole.ACCOUNTING };
    expect(component.getRoleLabel()).toBe('Accounting');

    component.currentUser = { role: UserRole.ADMIN };
    expect(component.getRoleLabel()).toBe('Admin');
  });

  it('should return Student as default when role is undefined', () => {
    component.currentUser = {};
    expect(component.getRoleLabel()).toBe('Student');
  });

  // ==================== ACTIVE ROUTE DETECTION ====================

  it('should detect exact route match', async () => {
    await router.navigate(['/dashboard']);
    expect(component.isActive('/dashboard')).toBeTrue();
  });

  it('should detect sub-route match', async () => {
    await router.navigate(['/dashboard/student-fees']);
    expect(component.isActive('/dashboard/student-fees')).toBeTrue();
  });

  it('should NOT match dashboard for sub-routes', async () => {
    await router.navigate(['/dashboard/profile']);
    expect(component.isActive('/dashboard')).toBeFalse();
  });

  it('should match parent route for nested sub-routes', async () => {
    await router.navigate(['/dashboard/student-fees']);
    // Should match the student-fees route but not just /dashboard
    expect(component.isActive('/dashboard/student-fees')).toBeTrue();
    expect(component.isActive('/dashboard')).toBeFalse();
  });

  // ==================== LOGOUT FUNCTIONALITY ====================

  it('should clear session storage on logout', () => {
    sessionStorage.setItem('currentUserId', '123');
    
    component.logout();
    
    expect(sessionStorage.getItem('currentUserId')).toBeNull();
  });

  it('should call userService.setUser with null on logout', () => {
    component.logout();
    
    expect(userServiceSpy.setUser).toHaveBeenCalledWith(null as any);
  });

  it('should navigate to login on logout', () => {
    const navigateSpy = spyOn(router, 'navigate');
    
    component.logout();
    
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});