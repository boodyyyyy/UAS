import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

/**
 * LOGIN COMPONENT TEST SUITE
 * 
 * This test suite validates the login functionality including:
 * - Component initialization and form setup
 * - Form validation rules
 * - Successful login flow via API
 * - Error handling for invalid credentials
 * - Remember username cookie functionality
 * - Navigation after successful login
 * 
 * Note: User authentication now uses the backend API instead of localStorage.
 */
describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let userServiceSpy = jasmine.createSpyObj('UserService', ['setUser']);
  let authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        Login,
        HttpClientTestingModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([]) // Only use this for standalone components
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "remember_username=; Max-Age=0; path=/;";
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('form should be valid when filled', () => {
    component.loginForm.setValue({
      username: 'yousef',
      password: '123456',
      rememberMe: false
    });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should show error when login fails', () => {
    const errorResponse = {
      error: {
        message: 'Invalid credentials'
      }
    };

    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.setValue({
      username: 'wrong',
      password: '123456',
      rememberMe: false
    });

    component.onSubmit();
    
    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should login successfully via API', () => {
    const navigateSpy = spyOn(component.router, 'navigate');
    const mockResponse = {
      data: {
        id: '1',
        username: 'yousef',
        name: 'Test User',
        email: 'test@test.com',
        role: 'student',
        picture: ''
      },
      meta: { token: 'test-token' },
      message: 'Login successful'
    };

    // Mock the login to return the observable
    authServiceSpy.login.and.returnValue(of(mockResponse));
    
    // The AuthService.handleAuthSuccess calls userService.setUser internally
    // Since we're using a spy, we need to manually trigger it or check the authService
    // For now, let's just verify login was called and navigation happened
    component.loginForm.setValue({
      username: 'yousef',
      password: '123456',
      rememberMe: false
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith('yousef', '123456');
    // Note: userService.setUser is called by AuthService.handleAuthSuccess
    // In a real scenario, this would be called, but with spies we can't easily test it
    // The important thing is that login was called and navigation happened
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should store remember_username cookie when rememberMe is checked', () => {
    const navigateSpy = spyOn(component.router, 'navigate');
    const mockResponse = {
      data: {
        id: '1',
        username: 'yousef',
        name: 'Test User',
        email: 'test@test.com',
        role: 'student',
        picture: ''
      },
      meta: { token: 'test-token' },
      message: 'Login successful'
    };

    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.loginForm.setValue({
      username: 'yousef',
      password: '123456',
      rememberMe: true
    });

    component.onSubmit();

    expect(document.cookie.includes('remember_username=yousef')).toBeTrue();
  });

  it('should clear remember_username cookie when rememberMe is false', () => {
    const navigateSpy = spyOn(component.router, 'navigate');
    const mockResponse = {
      data: {
        id: '1',
        username: 'yousef',
        name: 'Test User',
        email: 'test@test.com',
        role: 'student',
        picture: ''
      },
      meta: { token: 'test-token' },
      message: 'Login successful'
    };

    authServiceSpy.login.and.returnValue(of(mockResponse));
    document.cookie = "remember_username=yousef; path=/;";

    component.loginForm.setValue({
      username: 'yousef',
      password: '123456',
      rememberMe: false
    });

    component.onSubmit();

    expect(document.cookie.includes('remember_username')).toBeFalse();
  });
});