import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { UserService } from '../../services/user.service';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let userServiceSpy = jasmine.createSpyObj('UserService', ['setUser']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        Login,
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        provideRouter([]) // Only use this for standalone components
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;

    localStorage.setItem('users', JSON.stringify([
      { id: '1', username: 'yousef', password: '123456', role: 'student' }
    ]));

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

  it('should show error when username does not exist', () => {
    component.loginForm.setValue({
      username: 'wrong',
      password: '123456',
      rememberMe: false
    });

    component.onSubmit();
    expect(component.errorMessage).toBe('User not found');
  });

  it('should show error when password is incorrect', () => {
    component.loginForm.setValue({
      username: 'yousef',
      password: 'wrongpw',
      rememberMe: false
    });

    component.onSubmit();
    expect(component.errorMessage).toBe('Incorrect password');
  });

  it('should login successfully and set sessionStorage', () => {
    const navigateSpy = spyOn(component.router, 'navigate');
    
    component.loginForm.setValue({
      username: 'yousef',
      password: '123456',
      rememberMe: false
    });

    component.onSubmit();

    expect(sessionStorage.getItem('currentUserId')).toBe('1');
    expect(userServiceSpy.setUser).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should store remember_username cookie when rememberMe is checked', () => {
    component.loginForm.setValue({
      username: 'yousef',
      password: '123456',
      rememberMe: true
    });

    component.onSubmit();

    expect(document.cookie.includes('remember_username=yousef')).toBeTrue();
  });

  it('should clear remember_username cookie when rememberMe is false', () => {
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