import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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
    private authService: AuthService
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: [UserRole.STUDENT, [Validators.required]],
      picture: ['']
    },
    {
      validators: [this.passwordMatchValidator]
    });
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
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const formValue = this.signupForm.value;
      
      // Map UserRole enum to API role string
      const roleMap: { [key: string]: string } = {
        [UserRole.ADMIN]: 'admin',
        [UserRole.ACCOUNTING]: 'accounting',
        [UserRole.STUDENT]: 'student'
      };
      
      const registerData = {
        username: formValue.username,
        name: formValue.name,
        email: formValue.email,
        password: formValue.password,
        password_confirmation: formValue.confirmPassword,
        role: roleMap[formValue.role] || 'student',
        picture: formValue.picture || ''
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Account created successfully! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.error && error.error.errors) {
            // Handle validation errors
            const errors = error.error.errors;
            const firstError = Object.values(errors)[0];
            this.errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
        }
      });
    }
  }
}
