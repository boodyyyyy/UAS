import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip adding token to public endpoints
    const publicEndpoints = ['/auth/login', '/auth/register', '/health'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      request.url.includes(endpoint)
    );

    // Get token from localStorage (fallback - cookie is primary)
    const token = this.authService.getToken();

    // Clone request and add headers
    let clonedRequest = request.clone({
      setHeaders: {},
      withCredentials: true // Important for cookie-based auth
    });

    // Add Authorization header if token exists and not public endpoint
    if (token && !isPublicEndpoint) {
      clonedRequest = clonedRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle the request
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized
        if (error.status === 401) {
          // Token expired or invalid
          this.authService.logout().subscribe({
            next: () => {
              this.router.navigate(['/login']);
            },
            error: () => {
              this.router.navigate(['/login']);
            }
          });
        }

        // Handle 403 Forbidden
        if (error.status === 403) {
          // User doesn't have permission
          // Could show a message or redirect to dashboard
          console.warn('Access forbidden');
        }

        return throwError(() => error);
      })
    );
  }
}

