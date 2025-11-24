import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Signup } from './signup';
import { UserService } from '../../services/user.service';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { UserRole } from '../../models/user.model';

/**
 * SIGNUP COMPONENT TEST SUITE
 * 
 * This test suite validates the signup functionality including:
 * - Component initialization and form setup
 * - Form validation rules (required fields, email format, password length)
 * - Custom validators (username uniqueness, password matching)
 * - Successful user registration flow
 * - Cookie management for theme preferences
 * - Navigation after successful signup
 */

describe('Signup Component', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;
  let userServiceSpy = jasmine.createSpyObj('UserService', ['setUser']);

  beforeEach(async () => {
    // Configure TestBed with minimal dependencies for standalone component
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        Signup,
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        provideRouter([]) // Provides router for navigation testing
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;

    // Setup: Add existing user for username validation tests
    localStorage.setItem('users', JSON.stringify([
      { id: '1', username: 'existinguser', email: 'existing@test.com', role: UserRole.STUDENT }
    ]));

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
    expect(component.signupForm.get('creditCard')).toBeTruthy();
    expect(component.signupForm.get('preferences')).toBeTruthy();
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

  it('should show error when username already exists', () => {
    component.signupForm.patchValue({
      username: 'existinguser', // This username exists in localStorage
      name: 'Test User',
      email: 'test@test.com',
      password: '123456',
      confirmPassword: '123456'
    });

    // Trigger the validator
    component.usernameExistsValidator(component.signupForm);
    
    const username = component.signupForm.get('username');
    expect(username?.hasError('usernameTaken')).toBeTrue();
  });

  it('should allow new unique username', () => {
    component.signupForm.patchValue({
      username: 'newuser',
      name: 'Test User',
      email: 'test@test.com',
      password: '123456',
      confirmPassword: '123456'
    });

    component.usernameExistsValidator(component.signupForm);
    
    const username = component.signupForm.get('username');
    expect(username?.hasError('usernameTaken')).toBeFalsy();
  });

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

  it('should create new user and save to localStorage on valid submission', () => {
    component.signupForm.setValue({
      username: 'newuser',
      name: 'New User',
      email: 'new@test.com',
      password: '123456',
      confirmPassword: '123456',
      role: UserRole.STUDENT,
      picture: '',
      creditCard: { number: '', expiry: '', cvv: '' },
      preferences: { theme: 'light', notifications: true, language: 'en' }
    });

    component.onSubmit();

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    expect(users.length).toBe(2); // 1 existing + 1 new
    
    const newUser = users.find((u: any) => u.username === 'newuser');
    expect(newUser).toBeTruthy();
    expect(newUser.email).toBe('new@test.com');
    expect(newUser.role).toBe(UserRole.STUDENT);
  });

  it('should set theme cookie on successful signup', () => {
    component.signupForm.setValue({
      username: 'newuser',
      name: 'New User',
      email: 'new@test.com',
      password: '123456',
      confirmPassword: '123456',
      role: UserRole.STUDENT,
      picture: '',
      creditCard: { number: '', expiry: '', cvv: '' },
      preferences: { theme: 'dark', notifications: true, language: 'en' }
    });

    component.onSubmit();

    expect(document.cookie.includes('theme=dark')).toBeTrue();
  });

  it('should show success message on successful signup', () => {
    component.signupForm.setValue({
      username: 'newuser',
      name: 'New User',
      email: 'new@test.com',
      password: '123456',
      confirmPassword: '123456',
      role: UserRole.STUDENT,
      picture: '',
      creditCard: { number: '', expiry: '', cvv: '' },
      preferences: { theme: 'light', notifications: true, language: 'en' }
    });

    component.onSubmit();

    expect(component.successMessage).toBe('Account created successfully! Please log in to continue.');
  });

  it('should navigate to login after successful signup', (done) => {
    const navigateSpy = spyOn(component.router, 'navigate');
    
    component.signupForm.setValue({
      username: 'newuser',
      name: 'New User',
      email: 'new@test.com',
      password: '123456',
      confirmPassword: '123456',
      role: UserRole.STUDENT,
      picture: '',
      creditCard: { number: '', expiry: '', cvv: '' },
      preferences: { theme: 'light', notifications: true, language: 'en' }
    });

    component.onSubmit();

    // Wait for the setTimeout in component (1500ms)
    setTimeout(() => {
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      done();
    }, 1600);
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