import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  signupForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  roles = [UserRole.STUDENT, UserRole.ACCOUNTING, UserRole.ADMIN];

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private userService: UserService
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: [UserRole.STUDENT, [Validators.required]],
      picture: [''],
      creditCard: this.fb.group({
        number: [''],
        expiry: [''],
        cvv: ['']
      }),
      preferences: this.fb.group({
        theme: ['light'],
        notifications: [true],
        language: ['en']
      })
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const formValue = this.signupForm.value;
      
      // Create user object
      const newUser = {
        id: Date.now().toString(),
        username: formValue.username,
        name: formValue.name,
        email: formValue.email,
        picture: formValue.picture || '',
        role: formValue.role as UserRole,
        creditCard: formValue.creditCard || { number: '', expiry: '', cvv: '' },
        preferences: formValue.preferences || { theme: 'light', notifications: true, language: 'en' }
      };
      
      // Save user to UserService
      this.userService.setUser(newUser);
      
      // Show success and redirect to dashboard
      this.successMessage = 'Account created successfully! Redirecting to dashboard...';
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
    }
  }
}
