import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;
  isLoginMode = true; // Toggle between login and signup

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private userService: UserService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  toggleMode() {
    if (!this.isLoginMode) {
      // If currently in signup mode, switch to login mode
      this.isLoginMode = true;
      this.errorMessage = '';
      this.loginForm.reset({ rememberMe: false });
    } else {
      // If in login mode, navigate to signup page
      this.router.navigate(['/signup']);
    }
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const username = this.loginForm.value.username.toLowerCase();
      const password = this.loginForm.value.password;
      
      // Determine role based on username (for demo purposes)
      let role: UserRole = UserRole.STUDENT;
      if (username.includes('admin')) {
        role = UserRole.ADMIN;
      } else if (username.includes('accounting') || username.includes('finance')) {
        role = UserRole.ACCOUNTING;
      }
      
      // Set user in UserService
      this.userService.setUser({
        id: Date.now().toString(),
        username: this.loginForm.value.username,
        name: this.loginForm.value.username.charAt(0).toUpperCase() + this.loginForm.value.username.slice(1),
        email: `${this.loginForm.value.username}@university.edu`,
        picture: '',
        role: role,
        creditCard: { number: '', expiry: '', cvv: '' },
        preferences: { theme: 'light', notifications: true, language: 'en' }
      });
      
      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
    }
  }
}
