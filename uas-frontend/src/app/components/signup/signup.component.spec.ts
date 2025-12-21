import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signup } from './signup';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { UserRole } from '../../models/user.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

/**
 * SIGNUP COMPONENT TEST SUITE
 * 
 * This test suite validates the signup functionality including:
 * - Component initialization and form setup
 * - Form validation rules (required fields, email format, password length)
 * - Custom validators (password matching)
 * - Successful user registration flow via API
 * - Navigation after successful signup
 * 
 * Note: User registration now uses the backend API instead of localStorage.
 * Username uniqueness is validated by the backend API.
 */

describe('Signup Component', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;
  let userServiceSpy = jasmine.createSpyObj('UserService', ['setUser']);
  let authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

  beforeEach(async () => {
    // Configure TestBed with minimal dependencies for standalone component
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        Signup,
        HttpClientTestingModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([]) // Provides router for navigation testing
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    // Cleanup: Clear all storage and cookies after each test
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  });

  // ==================== COMPONENT INITIALIZATION ====================
  
  it('should create the signup component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with all required fields', () => {
    // Verify all form controls exist
    expect(component.signupForm.get('username')).toBeTruthy();
    expect(component.signupForm.get('name')).toBeTruthy();
    expect(component.signupForm.get('email')).toBeTruthy();
    expect(component.signupForm.get('password')).toBeTruthy();
    expect(component.signupForm.get('confirmPassword')).toBeTruthy();
    expect(component.signupForm.get('role')).toBeTruthy();
    expect(component.signupForm.get('picture')).toBeTruthy();
  });

  it('should have default role set to STUDENT', () => {
    expect(component.signupForm.get('role')?.value).toBe(UserRole.STUDENT);
  });

  // ==================== FORM VALIDATION ====================

  it('form should be invalid when empty', () => {
    expect(component.signupForm.valid).toBeFalse();
  });

  it('should validate username minimum length', () => {
    const username = component.signupForm.get('username');
    username?.setValue('ab'); // Less than 3 characters
    expect(username?.hasError('minlength')).toBeTrue();
  });

  it('should validate email format', () => {
    const email = component.signupForm.get('email');
    email?.setValue('invalidemail');
    expect(email?.hasError('email')).toBeTrue();
    
    email?.setValue('valid@email.com');
    expect(email?.hasError('email')).toBeFalse();
  });

  it('should validate password minimum length', () => {
    const password = component.signupForm.get('password');
    password?.setValue('12345'); // Less than 6 characters
    expect(password?.hasError('minlength')).toBeTrue();
  });

  // ==================== CUSTOM VALIDATORS ====================

  // Note: Username uniqueness is now validated by the backend API
  // The frontend no longer checks localStorage for existing usernames

  it('should show error when passwords do not match', () => {
    component.signupForm.patchValue({
      password: '123456',
      confirmPassword: '654321' // Different password
    });

    component.passwordMatchValidator(component.signupForm);
    
    const confirmPassword = component.signupForm.get('confirmPassword');
    expect(confirmPassword?.hasError('passwordMismatch')).toBeTrue();
  });

  it('should not show error when passwords match', () => {
    component.signupForm.patchValue({
      password: '123456',
      confirmPassword: '123456'
    });

    component.passwordMatchValidator(component.signupForm);
    
    const confirmPassword = component.signupForm.get('confirmPassword');
    expect(confirmPassword?.hasError('passwordMismatch')).toBeFalsy();
  });

  // ==================== SUCCESSFUL SIGNUP FLOW ====================

  it('should register user via API on valid submission', () => {
    const mockResponse = {
      data: {
        id: '1',
        username: 'newuser',
        name: 'New User',
        email: 'new@test.com',
        role: UserRole.STUDENT,
        picture: ''
      },
      meta: { token: 'test-token' },
      message: 'User registered successfully'
    };

    authServiceSpy.register.and.returnValue(of(mockResponse));

    // Password must be at least 8 characters (minLength: 8)
    component.signupForm.patchValue({
      username: 'newuser',
      name: 'New User',
      email: 'new@test.com',
      password: '12345678',
      confirmPassword: '12345678',
      role: UserRole.STUDENT,
      picture: ''
    });

    // Trigger password match validator
    component.passwordMatchValidator(component.signupForm);
    component.signupForm.updateValueAndValidity();

    expect(component.signupForm.valid).toBeTrue();
    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      username: 'newuser',
      name: 'New User',
      email: 'new@test.com',
      password: '12345678',
      password_confirmation: '12345678',
      role: UserRole.STUDENT,
      picture: ''
    });
  });

  it('should show success message on successful signup', () => {
    const mockResponse = {
      data: {
        id: '1',
        username: 'newuser',
        name: 'New User',
        email: 'new@test.com',
        role: UserRole.STUDENT,
        picture: ''
      },
      meta: { token: 'test-token' },
      message: 'User registered successfully'
    };

    authServiceSpy.register.and.returnValue(of(mockResponse));

    // Password must be at least 8 characters
    component.signupForm.patchValue({
      username: 'newuser',
      name: 'New User',
      email: 'new@test.com',
      password: '12345678',
      confirmPassword: '12345678',
      role: UserRole.STUDENT,
      picture: ''
    });

    // Trigger password match validator
    component.passwordMatchValidator(component.signupForm);
    component.signupForm.updateValueAndValidity();

    component.onSubmit();

    expect(component.successMessage).toBe('Account created successfully! Redirecting to login...');
  });

  it('should navigate to login after successful signup', (done) => {
    const navigateSpy = spyOn(component.router, 'navigate');
    const mockResponse = {
      data: {
        id: '1',
        username: 'newuser',
        name: 'New User',
        email: 'new@test.com',
        role: UserRole.STUDENT,
        picture: ''
      },
      meta: { token: 'test-token' },
      message: 'User registered successfully'
    };

    authServiceSpy.register.and.returnValue(of(mockResponse));

    // Password must be at least 8 characters
    component.signupForm.patchValue({
      username: 'newuser',
      name: 'New User',
      email: 'new@test.com',
      password: '12345678',
      confirmPassword: '12345678',
      role: UserRole.STUDENT,
      picture: ''
    });

    // Trigger password match validator
    component.passwordMatchValidator(component.signupForm);
    component.signupForm.updateValueAndValidity();

    component.onSubmit();

    // Wait for the setTimeout in component (1500ms)
    setTimeout(() => {
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      done();
    }, 1600);
  });

  it('should show error message on registration failure', () => {
    const errorResponse = {
      error: {
        message: 'Username already taken'
      }
    };

    authServiceSpy.register.and.returnValue(throwError(() => errorResponse));

    // Password must be at least 8 characters
    component.signupForm.patchValue({
      username: 'existinguser',
      name: 'New User',
      email: 'new@test.com',
      password: '12345678',
      confirmPassword: '12345678',
      role: UserRole.STUDENT,
      picture: ''
    });

    // Trigger password match validator
    component.passwordMatchValidator(component.signupForm);
    component.signupForm.updateValueAndValidity();

    component.onSubmit();

    expect(component.errorMessage).toBe('Username already taken');
  });

  // ==================== ROLE SELECTION ====================

  it('should allow selecting different user roles', () => {
    const role = component.signupForm.get('role');
    
    role?.setValue(UserRole.ACCOUNTING);
    expect(role?.value).toBe(UserRole.ACCOUNTING);
    
    role?.setValue(UserRole.ADMIN);
    expect(role?.value).toBe(UserRole.ADMIN);
  });

  // ==================== NAVIGATION ====================

  it('should navigate to login when navigateToLogin is called', () => {
    const navigateSpy = spyOn(component.router, 'navigate');
    
    component.navigateToLogin();
    
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});