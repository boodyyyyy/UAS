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
  isLoginMode = true;

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

    // Load remembered user if exists
    const rememberedUsername = this.getCookie('remember_username');
    if (rememberedUsername) {
      this.loginForm.patchValue({
        username: rememberedUsername,
        rememberMe: true
      });
    }
  }

  toggleMode() {
  this.isLoginMode = true;
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password, rememberMe } = this.loginForm.value;

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) =>
        u.username.toLowerCase() === username.toLowerCase()
      );

      if (!user) {
        this.errorMessage = 'User not found';
        return;
      }

      if (user.password !== password) {
        this.errorMessage = 'Incorrect password';
        return;
      }

      // Save session
      sessionStorage.setItem('currentUserId', user.id);

      // Correct Remember Me behavior
      if (rememberMe) {
        document.cookie = `remember_username=${encodeURIComponent(user.username)}; path=/; max-age=604800; SameSite=Lax`;
      } else {
        document.cookie = "remember_username=; Max-Age=0; path=/;";
      }

      // Push to UserService
      this.userService.setUser(user);

      // Redirect
      this.router.navigate(['/dashboard']);
    }
  }
}
