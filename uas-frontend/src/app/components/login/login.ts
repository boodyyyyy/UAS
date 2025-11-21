import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
    public router: Router
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
      // Frontend-only: just navigate to dashboard without authentication
      this.router.navigate(['/dashboard']);
    }
  }
}
