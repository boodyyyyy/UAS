import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
    private authService: AuthService
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
      this.isLoading = true;
      this.errorMessage = '';
      
      const { username, password, rememberMe } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Handle Remember Me
          if (rememberMe) {
            document.cookie = `remember_username=${encodeURIComponent(username)}; path=/; max-age=604800; SameSite=Lax`;
          } else {
            document.cookie = "remember_username=; Max-Age=0; path=/;";
          }

          // Redirect to dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Login failed. Please check your credentials.';
          }
        }
      });
    }
  }
}
