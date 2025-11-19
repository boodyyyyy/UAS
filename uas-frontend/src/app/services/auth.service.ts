import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly USERS_KEY = 'uas_users';
  private readonly CURRENT_USER_KEY = 'uas_current_user';
  private readonly SESSION_KEY = 'uas_session';

  constructor(
    private storage: StorageService,
    private router: Router
  ) {
    this.loadCurrentUser();
  }

  // Initialize with default users if none exist
  private initializeUsers(): void {
    const existingUsers = this.storage.getLocalStorage<User[]>(this.USERS_KEY);
    if (!existingUsers || existingUsers.length === 0) {
      const defaultUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          name: 'Admin User',
          email: 'admin@university.edu',
          password: 'admin123',
          role: UserRole.ADMIN,
          createdAt: new Date(),
          isActive: true
        },
        {
          id: '2',
          username: 'accounting',
          name: 'Accounting Personnel',
          email: 'accounting@university.edu',
          password: 'accounting123',
          role: UserRole.ACCOUNTING,
          createdAt: new Date(),
          isActive: true
        },
        {
          id: '3',
          username: 'student',
          name: 'Alex Johnson',
          email: 'alex.johnson@university.edu',
          password: 'student123',
          role: UserRole.STUDENT,
          createdAt: new Date(),
          isActive: true
        }
      ];
      this.storage.setLocalStorage(this.USERS_KEY, defaultUsers);
    }
  }

  signup(userData: Omit<User, 'id' | 'createdAt' | 'isActive'>): Observable<boolean> {
    return new Observable(observer => {
      this.initializeUsers();
      const users = this.storage.getLocalStorage<User[]>(this.USERS_KEY) || [];
      
      // Check if username or email already exists
      if (users.some(u => u.username === userData.username || u.email === userData.email)) {
        observer.error('Username or email already exists');
        return;
      }

      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date(),
        isActive: true
      };

      users.push(newUser);
      this.storage.setLocalStorage(this.USERS_KEY, users);
      observer.next(true);
      observer.complete();
    });
  }

  login(username: string, password: string): Observable<User> {
    return new Observable(observer => {
      this.initializeUsers();
      const users = this.storage.getLocalStorage<User[]>(this.USERS_KEY) || [];
      const user = users.find(u => u.username === username && u.password === password && u.isActive);

      if (user) {
        // Store in session storage for current session
        this.storage.setSessionStorage(this.SESSION_KEY, user.id);
        // Store in localStorage for persistence
        this.storage.setLocalStorage(this.CURRENT_USER_KEY, user);
        // Store in cookie for server-side access (if needed)
        this.storage.setCookie('uas_user_id', user.id, 7);
        
        this.currentUserSubject.next(user);
        observer.next(user);
        observer.complete();
      } else {
        observer.error('Invalid username or password');
      }
    });
  }

  logout(): void {
    this.storage.removeSessionStorage(this.SESSION_KEY);
    this.storage.removeLocalStorage(this.CURRENT_USER_KEY);
    this.storage.removeCookie('uas_user_id');
    this.currentUserSubject.next(null);
    this.router.navigate(['/home']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.includes(user.role) : false;
  }

  private loadCurrentUser(): void {
    const sessionId = this.storage.getSessionStorage<string>(this.SESSION_KEY);
    if (sessionId) {
      const user = this.storage.getLocalStorage<User>(this.CURRENT_USER_KEY);
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  }

  updateUser(user: User): void {
    const users = this.storage.getLocalStorage<User[]>(this.USERS_KEY) || [];
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      this.storage.setLocalStorage(this.USERS_KEY, users);
      this.storage.setLocalStorage(this.CURRENT_USER_KEY, user);
      this.currentUserSubject.next(user);
    }
  }
}

