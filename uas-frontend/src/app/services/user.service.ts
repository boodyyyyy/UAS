import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserRole } from '../models/user.model';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  picture: string;
  role: UserRole;
  creditCard?: {
    number: string;
    expiry: string;
    cvv: string;
  };
  preferences?: {
    theme: string;
    notifications: boolean;
    language: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User>(this.loadUserFromStorage());
  public user$: Observable<User> = this.userSubject.asObservable();

  constructor() {
    const sessionUserId = sessionStorage.getItem('currentUserId');
    if (sessionUserId) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.id === sessionUserId);
      if (user) {
        this.userSubject.next(user);
      }
    }
  }

  // Role-based helper methods
  isStudent(): boolean {
    return this.getUser()?.role === UserRole.STUDENT;
  }

  isAccounting(): boolean {
    return this.getUser()?.role === UserRole.ACCOUNTING;
  }

  isAdmin(): boolean {
    return this.getUser()?.role === UserRole.ADMIN;
  }

  hasRole(role: UserRole): boolean {
    return this.getUser()?.role === role;
  }

  canAccess(requiredRole: UserRole | UserRole[]): boolean {
    const userRole = this.getUser()?.role;
    if (!userRole) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    // Admin can access everything
    if (userRole === UserRole.ADMIN) return true;
    
    return userRole === requiredRole;
  }

  getUser(): User {
    return this.userSubject.value;
  }

  setUser(user: User): void {
    this.userSubject.next(user);
    //→ updates RAM + triggers UI updates
  }

  updateUser(updates: Partial<User>): void {
    const currentUser = this.getUser();
    const updatedUser = { ...currentUser, ...updates };
    this.setUser(updatedUser);
  }

  private loadUserFromStorage(): User {
    const sessionUserId = sessionStorage.getItem('currentUserId');
    if (!sessionUserId) return null as any;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((u: User) => String(u.id) === sessionUserId) || null as any;
  }

}

