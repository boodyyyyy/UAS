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
  private readonly STORAGE_KEY = 'uas_user_profile';
  private userSubject = new BehaviorSubject<User>(this.loadUserFromStorage());
  public user$: Observable<User> = this.userSubject.asObservable();

  constructor() {
    // Initialize with default user if none exists
    if (!this.getUser()) {
      this.setUser({
        id: '1',
        username: 'demouser',
        name: 'Demo User',
        email: 'demo@university.edu',
        picture: '',
        role: UserRole.STUDENT,
        creditCard: { number: '', expiry: '', cvv: '' },
        preferences: { theme: 'light', notifications: true, language: 'en' }
      });
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
    this.saveUserToStorage(user);
  }

  updateUser(updates: Partial<User>): void {
    const currentUser = this.getUser();
    const updatedUser = { ...currentUser, ...updates };
    this.setUser(updatedUser);
  }

  private loadUserFromStorage(): User {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        // Ensure role is a valid UserRole enum value
        if (!user.role || !Object.values(UserRole).includes(user.role)) {
          user.role = UserRole.STUDENT;
        }
        return user;
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
    return {
      id: '1',
      username: 'demouser',
      name: 'Demo User',
      email: 'demo@university.edu',
      picture: '',
      role: UserRole.STUDENT,
      creditCard: { number: '', expiry: '', cvv: '' },
      preferences: { theme: 'light', notifications: true, language: 'en' }
    };
  }

  private saveUserToStorage(user: User): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }
}

