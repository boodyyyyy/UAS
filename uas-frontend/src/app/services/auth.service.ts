import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { UserService, User as UserServiceUser } from './user.service';
import { UserRole } from '../models/user.model';

export interface LoginResponse {
  data: any;
  meta: {
    token: string;
  };
  message: string;
}

export interface RegisterResponse {
  data: any;
  meta: {
    token: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {
    // Check authentication status on service initialization
    this.checkAuthStatus();
  }

  /**
   * Register a new user
   */
  register(userData: {
    username: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: UserRole;
    picture?: string;
  }): Observable<RegisterResponse> {
    // UserRole enum values are already strings ('admin', 'accounting', 'student')
    // which match the backend API expectations, so we can send directly
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/auth/register`,
      userData,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.handleAuthSuccess(response.data, response.meta.token);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Login user
   */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      { username, password },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.handleAuthSuccess(response.data, response.meta.token);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.handleLogout();
      }),
      catchError(error => {
        // Even if logout fails on server, clear local state
        this.handleLogout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/auth/me`,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.data) {
          this.userService.setUser(this.mapApiUserToLocalUser(response.data));
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError(error => {
        this.handleLogout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check authentication status on app load
   */
  private checkAuthStatus(): void {
    const token = this.getToken();
    if (token) {
      // Verify token is still valid by fetching current user
      this.getCurrentUser().subscribe({
        error: () => {
          // Token invalid, clear auth state
          this.handleLogout();
        }
      });
    } else {
      this.isAuthenticatedSubject.next(false);
    }
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(userData: any, token: string): void {
    // Store token in localStorage as fallback (cookie is primary)
    localStorage.setItem('auth_token', token);
    
    // Map API user to local user format
    const user = this.mapApiUserToLocalUser(userData);
    
    // Update user service
    this.userService.setUser(user);
    
    // Update auth state
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Handle logout (clear local state without API call)
   * Made public so interceptor can call it to avoid infinite loops
   */
  handleLogout(): void {
    // Clear token
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('currentUserId');
    
    // Clear user from service
    this.userService.setUser(null as any);
    
    // Update auth state
    this.isAuthenticatedSubject.next(false);
    
    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Check if token exists
   */
  private hasValidToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Map API user response to local User interface
   */
  private mapApiUserToLocalUser(apiUser: any): UserServiceUser {
    return {
      id: String(apiUser.id),
      username: apiUser.username,
      name: apiUser.name,
      email: apiUser.email,
      picture: apiUser.picture || '',
      role: this.mapApiRoleToUserRole(apiUser.role),
      newsletterSubscribed: apiUser.newsletterSubscribed || false
    };
  }

  /**
   * Map API role string to UserRole enum
   */
  private mapApiRoleToUserRole(role: string): UserRole {
    switch (role) {
      case 'admin':
        return UserRole.ADMIN;
      case 'accounting':
        return UserRole.ACCOUNTING;
      case 'student':
        return UserRole.STUDENT;
      default:
        return UserRole.STUDENT;
    }
  }
}

