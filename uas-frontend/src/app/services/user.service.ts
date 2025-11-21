import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  picture: string;
  role: string;
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
        role: 'student',
        creditCard: { number: '', expiry: '', cvv: '' },
        preferences: { theme: 'light', notifications: true, language: 'en' }
      });
    }
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
        return JSON.parse(stored);
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
      role: 'student',
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

