import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // STEP 1: Extract the roles from route data
    const allowed = route.data['roles'];
    // Could be: [UserRole.ADMIN], undefined, null, "string", 42, etc.
    
    // STEP 2: Get current user
    const user = this.userService.getUser();
    
    // ═══════════════════════════════════════════════════════════
    // DEFENSIVE CHECK #1: Validate Route Configuration
    // ═══════════════════════════════════════════════════════════
    // SCENARIO 1: Missing 'roles' key { undefined or null }
    // SCENARIO 2: Wrong type {String, Number, Object, etc.}
    // SCENARIO 3: Empty array []
    if (!allowed || !Array.isArray(allowed) || allowed.length === 0) {
      console.warn('RoleGuard: No roles defined in route data');
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    // ═══════════════════════════════════════════════════════════
    // DEFENSIVE CHECK #2: Validate User Exists
    // ═══════════════════════════════════════════════════════════
    // SCENARIO 1.1: No user logged in
    // SCENARIO 1.2: Session expired
    // SCENARIO 2.1: User's role doesn't exist or null or empty
    if (!user || !user.role) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    // ═══════════════════════════════════════════════════════════
    // ACTUAL ROLE CHECK: User has correct role?
    // ═══════════════════════════════════════════════════════════
    if (!allowed.includes(user.role)) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    // All checks passed!
    return true;
  }
}
