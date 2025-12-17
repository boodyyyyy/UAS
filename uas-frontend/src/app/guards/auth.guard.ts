import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

/**
 * AUTH GUARD - Protects routes from unauthenticated access
 * 
 * PURPOSE: Ensures only logged-in users can access protected routes
 * 
 * VALIDATION RULES:
 * - User must be authenticated (via AuthService)
 * - User object must exist (not null/undefined)
 * - User must have an 'id' property (indicates valid authentication)
 * 
 * USAGE:
 * {
 *   path: 'dashboard',
 *   canActivate: [AuthGuard],
 *   loadComponent: () => import('./dashboard')
 * }
 */

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Check authentication status
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const user = this.userService.getUser();
    
    // Check if user exists AND has an id (minimum requirement for valid user)
    // This prevents both null/undefined and empty objects from passing
    if (!user || !user.id) {
      this.router.navigate(['/login']);
      return false;
    }
    
    return true;
  }
}