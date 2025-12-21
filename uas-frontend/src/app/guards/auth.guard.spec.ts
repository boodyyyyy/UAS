import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { UserRole } from '../models/user.model';

/**
 * AUTH GUARD TEST SUITE
 * 
 * This test suite validates the AuthGuard which protects routes from unauthorized access:
 * - Allows authenticated users to access protected routes
 * - Redirects unauthenticated users to the login page
 * - Integration with UserService to check authentication state
 * - Navigation behavior when access is denied
 * 
 * The AuthGuard implements Angular's CanActivate interface to control
 * whether a route can be activated based on the user's authentication status.
 */

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Create spies for dependencies
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    // Set default authentication to true for most tests
    const authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.isAuthenticated.and.returnValue(true);
  });

  // ==================== GUARD CREATION ====================

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  // ==================== AUTHENTICATED USER ACCESS ====================

  it('should allow access when user is authenticated', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      name: 'Test User',
      email: 'test@test.com',
      picture: '',
      role: UserRole.STUDENT
    };

    userServiceSpy.getUser.and.returnValue(mockUser);

    const result = guard.canActivate();

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should allow access for student role', () => {
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'student',
      name: 'Student User',
      email: 'student@test.com',
      picture: '',
      role: UserRole.STUDENT
    });

    expect(guard.canActivate()).toBeTrue();
  });

  it('should allow access for accounting role', () => {
    userServiceSpy.getUser.and.returnValue({
      id: '2',
      username: 'accountant',
      name: 'Accounting User',
      email: 'acc@test.com',
      picture: '',
      role: UserRole.ACCOUNTING
    });

    expect(guard.canActivate()).toBeTrue();
  });

  it('should allow access for admin role', () => {
    userServiceSpy.getUser.and.returnValue({
      id: '3',
      username: 'admin',
      name: 'Admin User',
      email: 'admin@test.com',
      picture: '',
      role: UserRole.ADMIN
    });

    expect(guard.canActivate()).toBeTrue();
  });

  // ==================== UNAUTHENTICATED USER ACCESS ====================

  it('should deny access when user is not authenticated (null)', () => {
    userServiceSpy.getUser.and.returnValue(null as any);

    const result = guard.canActivate();

    expect(result).toBeFalse();
  });

  it('should deny access when user is not authenticated (undefined)', () => {
    userServiceSpy.getUser.and.returnValue(undefined as any);

    const result = guard.canActivate();

    expect(result).toBeFalse();
  });

  it('should navigate to login when user is not authenticated', () => {
    userServiceSpy.getUser.and.returnValue(null as any);

    guard.canActivate();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to login exactly once on denied access', () => {
    userServiceSpy.getUser.and.returnValue(null as any);

    guard.canActivate();

    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  });

  // ==================== EDGE CASES ====================

  it('should deny access when user object is empty', () => {
    // Empty object has no 'id', so it's invalid
    userServiceSpy.getUser.and.returnValue({} as any);

    const result = guard.canActivate();

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should deny access when user has no id property', () => {
    // User object exists but missing 'id' - corrupted/incomplete auth
    userServiceSpy.getUser.and.returnValue({
      username: 'testuser',
      role: UserRole.STUDENT
    } as any);

    const result = guard.canActivate();

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should deny access when user id is null', () => {
    userServiceSpy.getUser.and.returnValue({
      id: null,
      username: 'testuser',
      role: UserRole.STUDENT
    } as any);

    const result = guard.canActivate();

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should deny access when user id is empty string', () => {
    userServiceSpy.getUser.and.returnValue({
      id: '',
      username: 'testuser',
      role: UserRole.STUDENT
    } as any);

    const result = guard.canActivate();

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow access when user has minimal valid properties', () => {
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'minimal',
      role: UserRole.STUDENT
    } as any);

    const result = guard.canActivate();

    expect(result).toBeTrue();
  });

  // ==================== MULTIPLE CALLS ====================

  it('should consistently allow access for authenticated user across multiple calls', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      name: 'Test User',
      email: 'test@test.com',
      picture: '',
      role: UserRole.STUDENT
    };

    userServiceSpy.getUser.and.returnValue(mockUser);

    expect(guard.canActivate()).toBeTrue();
    expect(guard.canActivate()).toBeTrue();
    expect(guard.canActivate()).toBeTrue();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should consistently deny access for unauthenticated user across multiple calls', () => {
    userServiceSpy.getUser.and.returnValue(null as any);

    expect(guard.canActivate()).toBeFalse();
    expect(guard.canActivate()).toBeFalse();
    expect(guard.canActivate()).toBeFalse();

    expect(routerSpy.navigate).toHaveBeenCalledTimes(3);
  });

  // ==================== INTEGRATION WITH USERSERVICE ====================

  it('should call UserService.getUser to check authentication', () => {
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'test',
      role: UserRole.STUDENT
    } as any);

    guard.canActivate();

    expect(userServiceSpy.getUser).toHaveBeenCalled();
  });

  it('should call UserService.getUser exactly once per canActivate call', () => {
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'test',
      role: UserRole.STUDENT
    } as any);

    guard.canActivate();

    expect(userServiceSpy.getUser).toHaveBeenCalledTimes(1);
  });

  // ==================== NAVIGATION BEHAVIOR ====================

  it('should not navigate when access is granted', () => {
    userServiceSpy.getUser.and.returnValue({
      id: '1',
      username: 'test',
      role: UserRole.STUDENT
    } as any);

    guard.canActivate();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should navigate with correct route parameters', () => {
    userServiceSpy.getUser.and.returnValue(null as any);

    guard.canActivate();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/login']);
  });
});