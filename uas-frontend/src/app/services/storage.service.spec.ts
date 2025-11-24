import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

/**
 * STORAGE SERVICE TEST SUITE
 * 
 * This test suite validates the StorageService which provides a unified interface for:
 * - LocalStorage operations (persistent storage across sessions)
 * - SessionStorage operations (temporary storage cleared on tab close)
 * - JSON serialization/deserialization
 * - Type-safe retrieval with generics
 * - Bulk clear operations
 * 
 * The service abstracts away direct localStorage/sessionStorage access
 * and provides a consistent API with automatic JSON handling.
 */

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // ==================== SERVICE INITIALIZATION ====================

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ==================== LOCAL STORAGE - SET/GET ====================

  it('should store and retrieve string from localStorage', () => {
    service.setLocalStorage('testKey', 'testValue');
    const value = service.getLocalStorage<string>('testKey');
    
    expect(value).toBe('testValue');
  });

  it('should store and retrieve object from localStorage', () => {
    const testObject = { name: 'John', age: 30 };
    service.setLocalStorage('user', testObject);
    
    const retrieved = service.getLocalStorage<{ name: string; age: number }>('user');
    
    expect(retrieved).toEqual(testObject);
  });

  it('should store and retrieve array from localStorage', () => {
    const testArray = [1, 2, 3, 4, 5];
    service.setLocalStorage('numbers', testArray);
    
    const retrieved = service.getLocalStorage<number[]>('numbers');
    
    expect(retrieved).toEqual(testArray);
  });

  it('should store and retrieve complex nested object from localStorage', () => {
    const complexObject = {
      id: 1,
      user: { name: 'Alice', role: 'admin' },
      permissions: ['read', 'write', 'delete'],
      settings: { theme: 'dark', notifications: true }
    };
    
    service.setLocalStorage('config', complexObject);
    const retrieved = service.getLocalStorage<typeof complexObject>('config');
    
    expect(retrieved).toEqual(complexObject);
  });

  it('should return null when localStorage key does not exist', () => {
    const value = service.getLocalStorage('nonexistent');
    expect(value).toBeNull();
  });

  it('should handle boolean values in localStorage', () => {
    service.setLocalStorage('isActive', true);
    const value = service.getLocalStorage<boolean>('isActive');
    
    expect(value).toBeTrue();
  });

  it('should handle number values in localStorage', () => {
    service.setLocalStorage('count', 42);
    const value = service.getLocalStorage<number>('count');
    
    expect(value).toBe(42);
  });

  it('should handle null values in localStorage', () => {
    service.setLocalStorage('nullable', null);
    const value = service.getLocalStorage('nullable');
    
    expect(value).toBeNull();
  });

  // ==================== LOCAL STORAGE - REMOVE ====================

  it('should remove item from localStorage', () => {
    service.setLocalStorage('toRemove', 'value');
    expect(service.getLocalStorage('toRemove')).toBe('value');
    
    service.removeLocalStorage('toRemove');
    
    expect(service.getLocalStorage('toRemove')).toBeNull();
  });

  it('should not throw error when removing non-existent key from localStorage', () => {
    expect(() => service.removeLocalStorage('doesNotExist')).not.toThrow();
  });

  // ==================== LOCAL STORAGE - CLEAR ====================

  it('should clear all items from localStorage', () => {
    service.setLocalStorage('key1', 'value1');
    service.setLocalStorage('key2', 'value2');
    service.setLocalStorage('key3', 'value3');
    
    service.clearLocalStorage();
    
    expect(service.getLocalStorage('key1')).toBeNull();
    expect(service.getLocalStorage('key2')).toBeNull();
    expect(service.getLocalStorage('key3')).toBeNull();
  });

  // ==================== SESSION STORAGE - SET/GET ====================

  it('should store and retrieve string from sessionStorage', () => {
    service.setSessionStorage('sessionKey', 'sessionValue');
    const value = service.getSessionStorage<string>('sessionKey');
    
    expect(value).toBe('sessionValue');
  });

  it('should store and retrieve object from sessionStorage', () => {
    const sessionObject = { token: 'abc123', expires: 3600 };
    service.setSessionStorage('auth', sessionObject);
    
    const retrieved = service.getSessionStorage<typeof sessionObject>('auth');
    
    expect(retrieved).toEqual(sessionObject);
  });

  it('should store and retrieve array from sessionStorage', () => {
    const items = ['item1', 'item2', 'item3'];
    service.setSessionStorage('cart', items);
    
    const retrieved = service.getSessionStorage<string[]>('cart');
    
    expect(retrieved).toEqual(items);
  });

  it('should return null when sessionStorage key does not exist', () => {
    const value = service.getSessionStorage('missing');
    expect(value).toBeNull();
  });

  it('should handle complex nested object in sessionStorage', () => {
    const sessionData = {
      user: { id: 1, name: 'Bob' },
      cart: [{ id: 1, qty: 2 }, { id: 2, qty: 1 }],
      total: 99.99
    };
    
    service.setSessionStorage('checkout', sessionData);
    const retrieved = service.getSessionStorage<typeof sessionData>('checkout');
    
    expect(retrieved).toEqual(sessionData);
  });

  // ==================== SESSION STORAGE - REMOVE ====================

  it('should remove item from sessionStorage', () => {
    service.setSessionStorage('tempData', 'temporary');
    expect(service.getSessionStorage('tempData')).toBe('temporary');
    
    service.removeSessionStorage('tempData');
    
    expect(service.getSessionStorage('tempData')).toBeNull();
  });

  it('should not throw error when removing non-existent key from sessionStorage', () => {
    expect(() => service.removeSessionStorage('notThere')).not.toThrow();
  });

  // ==================== SESSION STORAGE - CLEAR ====================

  it('should clear all items from sessionStorage', () => {
    service.setSessionStorage('temp1', 'value1');
    service.setSessionStorage('temp2', 'value2');
    service.setSessionStorage('temp3', 'value3');
    
    service.clearSessionStorage();
    
    expect(service.getSessionStorage('temp1')).toBeNull();
    expect(service.getSessionStorage('temp2')).toBeNull();
    expect(service.getSessionStorage('temp3')).toBeNull();
  });

  // ==================== STORAGE ISOLATION ====================

  it('should keep localStorage and sessionStorage separate', () => {
    service.setLocalStorage('sharedKey', 'localValue');
    service.setSessionStorage('sharedKey', 'sessionValue');
    
    expect(service.getLocalStorage('sharedKey')).toBe('localValue');
    expect(service.getSessionStorage('sharedKey')).toBe('sessionValue');
  });

  it('should not affect sessionStorage when clearing localStorage', () => {
    service.setLocalStorage('local', 'localData');
    service.setSessionStorage('session', 'sessionData');
    
    service.clearLocalStorage();
    
    expect(service.getLocalStorage('local')).toBeNull();
    expect(service.getSessionStorage('session')).toBe('sessionData');
  });

  it('should not affect localStorage when clearing sessionStorage', () => {
    service.setLocalStorage('local', 'localData');
    service.setSessionStorage('session', 'sessionData');
    
    service.clearSessionStorage();
    
    expect(service.getSessionStorage('session')).toBeNull();
    expect(service.getLocalStorage('local')).toBe('localData');
  });

  // ==================== EDGE CASES ====================

  it('should handle empty string as value', () => {
    service.setLocalStorage('empty', '');
    const value = service.getLocalStorage<string>('empty');
    
    expect(value).toBe('');
  });

  it('should handle empty object as value', () => {
    service.setLocalStorage('emptyObj', {});
    const value = service.getLocalStorage<object>('emptyObj');
    
    expect(value).toEqual({});
  });

  it('should handle empty array as value', () => {
    service.setLocalStorage('emptyArr', []);
    const value = service.getLocalStorage<any[]>('emptyArr');
    
    expect(value).toEqual([]);
  });

  it('should handle zero as numeric value', () => {
    service.setLocalStorage('zero', 0);
    const value = service.getLocalStorage<number>('zero');
    
    expect(value).toBe(0);
  });

  it('should handle negative numbers', () => {
    service.setLocalStorage('negative', -42);
    const value = service.getLocalStorage<number>('negative');
    
    expect(value).toBe(-42);
  });

  it('should overwrite existing key with new value', () => {
    service.setLocalStorage('overwrite', 'original');
    expect(service.getLocalStorage('overwrite')).toBe('original');
    
    service.setLocalStorage('overwrite', 'updated');
    expect(service.getLocalStorage('overwrite')).toBe('updated');
  });

  // ==================== TYPE SAFETY ====================

  it('should maintain type information with generic return type', () => {
    interface UserData {
      id: number;
      name: string;
      active: boolean;
    }
    
    const userData: UserData = { id: 1, name: 'Test', active: true };
    service.setLocalStorage('userData', userData);
    
    const retrieved = service.getLocalStorage<UserData>('userData');
    
    // TypeScript should enforce this at compile time
    expect(retrieved?.id).toBe(1);
    expect(retrieved?.name).toBe('Test');
    expect(retrieved?.active).toBeTrue();
  });
});