import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { UserService } from '../services/user.service';
import { UserRole } from '../models/user.model';

/**
 * ROLE GUARD TEST SUITE
 * 
 * This test suite validates the RoleGuard which implements role-based access control:
 * - Allows users with correct roles to access protected routes
 * - Denies access to users with incorrect roles
 * - Redirects unauthorized users to the dashboard
 * - Handles multiple allowed roles per route
 * - Integration with route data to determine required roles
 * 
 * The RoleGuard implements Angular's CanActivate interface and reads
 * the 'roles' array from route data to determine which roles can access the route.
 */

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;

  beforeEach(() => {
    // Create spies for dependencies
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(RoleGuard);

    // Create mock route snapshot
    mockRoute = {
      data: { roles: [] }
    } as any;
  });

  // ==================== GUARD CREATION ====================

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  // ==================== SINGLE ROLE ACCESS CONTROL ====================

  it('should allow access when user has the required role', () => {
    mockRoute.data = { roles: [UserRole.STUDENT] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      name: 'Student User',
      email: 'student@test.com',
      picture: '',
      role: UserRole.STUDENT
    });

    const result = guard.canActivate(mockRoute);

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should deny access when user does not have the required role', () => {
    mockRoute.data = { roles: [UserRole.ADMIN] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      name: 'Student User',
      email: 'student@test.com',
      picture: '',
      role: UserRole.STUDENT
    });

    const result = guard.canActivate(mockRoute);

    expect(result).toBeFalse();
  });

  it('should redirect to dashboard when access is denied', () => {
    mockRoute.data = { roles: [UserRole.ADMIN] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    guard.canActivate(mockRoute);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  // ==================== MULTIPLE ROLES ACCESS CONTROL ====================

  it('should allow access when user has one of multiple allowed roles', () => {
    mockRoute.data = { roles: [UserRole.ACCOUNTING, UserRole.ADMIN] };
    userServiceSpy.getUser.and.returnValue({
      id: '2',
      username: 'accountant',
      name: 'Accounting User',
      email: 'acc@test.com',
      picture: '',
      role: UserRole.ACCOUNTING
    });

    const result = guard.canActivate(mockRoute);

    expect(result).toBeTrue();
  });

  it('should allow admin access when admin is in allowed roles', () => {
    mockRoute.data = { roles: [UserRole.STUDENT, UserRole.ACCOUNTING, UserRole.ADMIN] };
    userServiceSpy.getUser.and.returnValue({
      id: '3',
      username: 'admin',
      role: UserRole.ADMIN
    } as any);

    const result = guard.canActivate(mockRoute);

    expect(result).toBeTrue();
  });

  it('should deny access when user role is not in the allowed roles list', () => {
    mockRoute.data = { roles: [UserRole.ACCOUNTING, UserRole.ADMIN] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    const result = guard.canActivate(mockRoute);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  // ==================== EACH ROLE TYPE ====================

  it('should allow STUDENT access to student-only route', () => {
    mockRoute.data = { roles: [UserRole.STUDENT] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    expect(guard.canActivate(mockRoute)).toBeTrue();
  });

  it('should allow ACCOUNTING access to accounting-only route', () => {
    mockRoute.data = { roles: [UserRole.ACCOUNTING] };
    userServiceSpy.getUser.and.returnValue({
      id: '2',
      username: 'accountant',
      role: UserRole.ACCOUNTING
    } as any);

    expect(guard.canActivate(mockRoute)).toBeTrue();
  });

  it('should allow ADMIN access to admin-only route', () => {
    mockRoute.data = { roles: [UserRole.ADMIN] };
    userServiceSpy.getUser.and.returnValue({
      id: '3',
      username: 'admin',
      role: UserRole.ADMIN
    } as any);

    expect(guard.canActivate(mockRoute)).toBeTrue();
  });

  it('should deny STUDENT access to accounting-only route', () => {
    mockRoute.data = { roles: [UserRole.ACCOUNTING] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    expect(guard.canActivate(mockRoute)).toBeFalse();
  });

  it('should deny ACCOUNTING access to admin-only route', () => {
    mockRoute.data = { roles: [UserRole.ADMIN] };
    userServiceSpy.getUser.and.returnValue({
      id: '2',
      username: 'accountant',
      role: UserRole.ACCOUNTING
    } as any);

    expect(guard.canActivate(mockRoute)).toBeFalse();
  });

  // ==================== UNAUTHENTICATED USER ====================

  it('should deny access when user is not authenticated (null)', () => {
    mockRoute.data = { roles: [UserRole.STUDENT] };
    userServiceSpy.getUser.and.returnValue(null as any);

    const result = guard.canActivate(mockRoute);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should deny access when user is not authenticated (undefined)', () => {
    mockRoute.data = { roles: [UserRole.STUDENT] };
    userServiceSpy.getUser.and.returnValue(undefined as any);

    const result = guard.canActivate(mockRoute);

    expect(result).toBeFalse();
  });

  // ==================== EDGE CASES ====================

  it('should deny access when user has no role', () => {
    mockRoute.data = { roles: [UserRole.STUDENT] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'norole',
      role: undefined
    } as any);

    const result = guard.canActivate(mockRoute);

    expect(result).toBeFalse();
  });

  it('should deny access when route data has empty roles array', () => {
    mockRoute.data = { roles: [] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    const result = guard.canActivate(mockRoute);

    expect(result).toBeFalse();
  });

  it('should handle missing route data gracefully', () => {
    mockRoute.data = {}; // No 'roles' property
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    const result = guard.canActivate(mockRoute);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle undefined roles in route data', () => {
    mockRoute.data = { roles: undefined };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    const result = guard.canActivate(mockRoute);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle null roles in route data', () => {
    mockRoute.data = { roles: null };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    const result = guard.canActivate(mockRoute);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle non-array roles in route data', () => {
    mockRoute.data = { roles: 'STUDENT' }; // String instead of array
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    const result = guard.canActivate(mockRoute);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  // ==================== INTEGRATION WITH USERSERVICE ====================

  it('should call UserService.getUser to retrieve current user', () => {
    mockRoute.data = { roles: [UserRole.STUDENT] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    guard.canActivate(mockRoute);

    expect(userServiceSpy.getUser).toHaveBeenCalled();
  });

  it('should call UserService.getUser exactly once per canActivate call', () => {
    mockRoute.data = { roles: [UserRole.STUDENT] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    guard.canActivate(mockRoute);

    expect(userServiceSpy.getUser).toHaveBeenCalledTimes(1);
  });

  // ==================== NAVIGATION BEHAVIOR ====================

  it('should not navigate when access is granted', () => {
    mockRoute.data = { roles: [UserRole.STUDENT] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    guard.canActivate(mockRoute);

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard exactly once when access is denied', () => {
    mockRoute.data = { roles: [UserRole.ADMIN] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    guard.canActivate(mockRoute);

    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  // ==================== COMPLEX SCENARIOS ====================

  it('should handle route requiring all three roles', () => {
    mockRoute.data = { roles: [UserRole.STUDENT, UserRole.ACCOUNTING, UserRole.ADMIN] };

    // Student should pass
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);
    expect(guard.canActivate(mockRoute)).toBeTrue();

    // Accounting should pass
    userServiceSpy.getUser.and.returnValue({
      id: '2',
      username: 'accountant',
      role: UserRole.ACCOUNTING
    } as any);
    expect(guard.canActivate(mockRoute)).toBeTrue();

    // Admin should pass
    userServiceSpy.getUser.and.returnValue({
      id: '3',
      username: 'admin',
      role: UserRole.ADMIN
    } as any);
    expect(guard.canActivate(mockRoute)).toBeTrue();
  });

  it('should consistently deny access across multiple calls for wrong role', () => {
    mockRoute.data = { roles: [UserRole.ADMIN] };
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      role: UserRole.STUDENT
    } as any);

    expect(guard.canActivate(mockRoute)).toBeFalse();
    expect(guard.canActivate(mockRoute)).toBeFalse();
    expect(guard.canActivate(mockRoute)).toBeFalse();

    expect(routerSpy.navigate).toHaveBeenCalledTimes(3);
  });
});