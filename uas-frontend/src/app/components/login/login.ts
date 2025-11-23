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
      const { username, password, rememberMe } = this.loginForm.value;

      // 1. Load users from storage
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      // 2. Find matching user
      const user = users.find((u: any) =>
        u.username.toLowerCase() === username.toLowerCase()
      );

      if (!user) {
        this.errorMessage = 'User not found';
        return;
      }

      // 3. Validate password
      if (user.password !== password) {
        this.errorMessage = 'Incorrect password';
        return;
      }

      // 4. Save active session
      sessionStorage.setItem('currentUserId', user.id);

      // 5. Remember Me cookie (simulate httpOnly by storing non-sensitive token)
      if (rememberMe) {
        const token = btoa(user.id + ':' + Date.now());
        document.cookie = `remember_token=${token}; Secure; SameSite=Lax; path=/; max-age=604800`;
      }

      // 6. Push into UserService
      this.userService.setUser(user);

      // 7. Redirect
      this.router.navigate(['/dashboard']);
    }

  }
}
