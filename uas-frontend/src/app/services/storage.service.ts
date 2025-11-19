import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private cookieService: CookieService) {}

  // LocalStorage - for persistent data that should survive browser restarts
  setLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getLocalStorage<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  removeLocalStorage(key: string): void {
    localStorage.removeItem(key);
  }

  clearLocalStorage(): void {
    localStorage.clear();
  }

  // SessionStorage - for temporary data that should be cleared when tab closes
  setSessionStorage(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  getSessionStorage<T>(key: string): T | null {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  removeSessionStorage(key: string): void {
    sessionStorage.removeItem(key);
  }

  clearSessionStorage(): void {
    sessionStorage.clear();
  }

  // Cookies - for data that should be sent to server or persist across sessions
  setCookie(key: string, value: string, days: number = 7): void {
    this.cookieService.set(key, value, days);
  }

  getCookie(key: string): string {
    return this.cookieService.get(key);
  }

  removeCookie(key: string): void {
    this.cookieService.delete(key);
  }

  clearCookies(): void {
    this.cookieService.deleteAll();
  }
}

