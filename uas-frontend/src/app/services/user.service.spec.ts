import { TestBed } from '@angular/core/testing';
import { UserService, User } from './user.service';
import { UserRole } from '../models/user.model';

/**
 * USER SERVICE TEST SUITE
 * 
 * This test suite validates the UserService which manages user state and authentication:
 * - User state management with BehaviorSubject and Observable
 * - Loading user from sessionStorage on service initialization (legacy support)
 * - Role-based helper methods (isStudent, isAccounting, isAdmin)
 * - Access control methods (hasRole, canAccess)
 * - User updates and state synchronization
 * - Integration with localStorage for profile picture caching (legacy)
 * 
 * Note: User data is now primarily stored in the database and fetched via API.
 * localStorage is only used for profile picture caching and legacy support.
 */

describe('UserService', () => {
  let service: UserService;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    name: 'Test User',
    email: 'test@test.com',
    picture: 'profile.jpg',
    role: UserRole.STUDENT,
    creditCard: { number: '1234', expiry: '12/25', cvv: '123' },
    newsletterSubscribed: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    
    // Setup: Add users to localStorage (legacy support - users are now in database)
    // This is only for testing the legacy localStorage loading functionality
    localStorage.setItem('users', JSON.stringify([
      mockUser,
      { id: '2', username: 'admin', role: UserRole.ADMIN, email: 'admin@test.com', picture: '', newsletterSubscribed: false },
      { id: '3', username: 'accountant', role: UserRole.ACCOUNTING, email: 'acc@test.com', picture: '', newsletterSubscribed: false }
    ]));
    
    service = TestBed.inject(UserService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // ==================== SERVICE INITIALIZATION ====================

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load user from sessionStorage on initialization', () => {
    // Set session with user ID
    sessionStorage.setItem('currentUserId', '1');
    
    // Create new service instance
    const newService = new UserService();
    
    const user = newService.getUser();
    expect(user).toBeTruthy();
    expect(user.id).toBe('1');
    expect(user.username).toBe('testuser');
  });

  it('should return null when no session exists', () => {
    sessionStorage.clear();
    
    const newService = new UserService();
    const user = newService.getUser();
    
    expect(user).toBeFalsy();
  });

  // ==================== GET/SET USER ====================

  it('should get current user', () => {
    service.setUser(mockUser);
    const user = service.getUser();
    
    expect(user).toEqual(mockUser);
  });

  it('should set user and emit to observable', (done) => {
    service.user$.subscribe(user => {
      if (user && user.id === '1') {
        expect(user.username).toBe('testuser');
        done();
      }
    });
    
    service.setUser(mockUser);
  });

  it('should update user$ observable when setUser is called', (done) => {
    let callCount = 0;
    
    service.user$.subscribe(user => {
      callCount++;
      if (callCount === 2 && user) { // Skip initial emission
        expect(user.username).toBe('newuser');
        done();
      }
    });
    
    service.setUser({ ...mockUser, username: 'newuser' });
  });

  // ==================== UPDATE USER ====================

  it('should partially update user properties', () => {
    service.setUser(mockUser);
    
    service.updateUser({ name: 'Updated Name' });
    
    const user = service.getUser();
    expect(user.name).toBe('Updated Name');
    expect(user.username).toBe('testuser'); // Other properties unchanged
  });

  it('should update multiple properties at once', () => {
    service.setUser(mockUser);
    
    service.updateUser({ 
      name: 'New Name',
      email: 'new@email.com',
      picture: 'new.jpg'
    });
    
    const user = service.getUser();
    expect(user.name).toBe('New Name');
    expect(user.email).toBe('new@email.com');
    expect(user.picture).toBe('new.jpg');
  });

  it('should emit updated user to user$ observable', (done) => {
    service.setUser(mockUser);
    
    let emissionCount = 0;
    service.user$.subscribe(user => {
      emissionCount++;
      if (emissionCount === 2 && user) { // Skip initial emission
        expect(user.name).toBe('Updated');
        done();
      }
    });
    
    service.updateUser({ name: 'Updated' });
  });

  // ==================== ROLE-BASED HELPER METHODS ====================

  it('should return true for isStudent when user is student', () => {
    service.setUser({ ...mockUser, role: UserRole.STUDENT });
    expect(service.isStudent()).toBeTrue();
  });

  it('should return false for isStudent when user is not student', () => {
    service.setUser({ ...mockUser, role: UserRole.ADMIN });
    expect(service.isStudent()).toBeFalse();
  });

  it('should return true for isAccounting when user is accounting', () => {
    service.setUser({ ...mockUser, role: UserRole.ACCOUNTING });
    expect(service.isAccounting()).toBeTrue();
  });

  it('should return false for isAccounting when user is not accounting', () => {
    service.setUser({ ...mockUser, role: UserRole.STUDENT });
    expect(service.isAccounting()).toBeFalse();
  });

  it('should return true for isAdmin when user is admin', () => {
    service.setUser({ ...mockUser, role: UserRole.ADMIN });
    expect(service.isAdmin()).toBeTrue();
  });

  it('should return false for isAdmin when user is not admin', () => {
    service.setUser({ ...mockUser, role: UserRole.STUDENT });
    expect(service.isAdmin()).toBeFalse();
  });

  // ==================== HAS ROLE METHOD ====================

  it('should return true when user has specified role', () => {
    service.setUser({ ...mockUser, role: UserRole.STUDENT });
    expect(service.hasRole(UserRole.STUDENT)).toBeTrue();
  });

  it('should return false when user does not have specified role', () => {
    service.setUser({ ...mockUser, role: UserRole.STUDENT });
    expect(service.hasRole(UserRole.ADMIN)).toBeFalse();
  });

  // ==================== CAN ACCESS METHOD ====================

  it('should allow access when user has exact required role', () => {
    service.setUser({ ...mockUser, role: UserRole.STUDENT });
    expect(service.canAccess(UserRole.STUDENT)).toBeTrue();
  });

  it('should deny access when user does not have required role', () => {
    service.setUser({ ...mockUser, role: UserRole.STUDENT });
    expect(service.canAccess(UserRole.ADMIN)).toBeFalse();
  });

  it('should allow admin to access any single role requirement', () => {
    service.setUser({ ...mockUser, role: UserRole.ADMIN });
    
    expect(service.canAccess(UserRole.STUDENT)).toBeTrue();
    expect(service.canAccess(UserRole.ACCOUNTING)).toBeTrue();
    expect(service.canAccess(UserRole.ADMIN)).toBeTrue();
  });

  it('should allow access when user role is in array of allowed roles', () => {
    service.setUser({ ...mockUser, role: UserRole.STUDENT });
    
    expect(service.canAccess([UserRole.STUDENT, UserRole.ACCOUNTING])).toBeTrue();
  });

  it('should deny access when user role is not in array of allowed roles', () => {
    service.setUser({ ...mockUser, role: UserRole.STUDENT });
    
    expect(service.canAccess([UserRole.ACCOUNTING, UserRole.ADMIN])).toBeFalse();
  });

  it('should return false when no user is logged in', () => {
    service.setUser(null as any);
    
    expect(service.canAccess(UserRole.STUDENT)).toBeFalse();
    expect(service.canAccess([UserRole.STUDENT, UserRole.ADMIN])).toBeFalse();
  });

  // ==================== INTEGRATION WITH STORAGE (LEGACY) ====================

  it('should load user from localStorage based on sessionStorage ID (legacy support)', () => {
    sessionStorage.setItem('currentUserId', '2');
    
    const newService = new UserService();
    const user = newService.getUser();
    
    expect(user.username).toBe('admin');
    expect(user.role).toBe(UserRole.ADMIN);
  });

  it('should handle missing user in localStorage gracefully', () => {
    sessionStorage.setItem('currentUserId', '999'); // Non-existent ID
    
    const newService = new UserService();
    const user = newService.getUser();
    
    expect(user).toBeFalsy();
  });

  it('should handle empty localStorage gracefully', () => {
    localStorage.clear();
    sessionStorage.setItem('currentUserId', '1');
    
    const newService = new UserService();
    const user = newService.getUser();
    
    expect(user).toBeFalsy();
  });

  // ==================== NEWSLETTER SUBSCRIPTION ====================

  it('should handle newsletter subscription field', () => {
    const userWithNewsletter = { ...mockUser, newsletterSubscribed: true };
    service.setUser(userWithNewsletter);
    
    const user = service.getUser();
    expect(user.newsletterSubscribed).toBeTrue();
  });

  // ==================== OBSERVABLE BEHAVIOR ====================

  it('should emit initial value immediately on subscription', (done) => {
    service.setUser(mockUser);
    
    service.user$.subscribe(user => {
      expect(user).toBeTruthy();
      expect(user.username).toBe('testuser');
      done();
    });
  });

  it('should emit to subscribers when user changes', () => {
    const receivedValues: User[] = [];
    
    service.user$.subscribe(user => {
      if (user) receivedValues.push(user);
    });
    
    service.setUser(mockUser);
    
    expect(receivedValues.length).toBe(1);
    expect(receivedValues[0]).toEqual(mockUser);
  });
});