# Cookie Storage Explanation

This document explains how cookies are stored and managed in the UAS application, showing the exact files and locations where cookie operations occur.

## Overview

The application uses **two types of cookies**:

1. **Authentication Cookie (`auth_token`)** - HTTP-only cookie set by the backend (primary authentication)
2. **Remember Username Cookie (`remember_username`)** - Client-side cookie for user convenience

---

## 1. Authentication Cookie (`auth_token`)

### Purpose
Primary authentication mechanism using HTTP-only cookies for security.

### How It Works

#### **Backend: Cookie Creation** 
📍 **File:** `UAS/uas-backend/app/Http/Controllers/AuthController.php`

**On Login (Line 78):**
```php
// Set secure HTTP-only cookie for SPA
$response->cookie('auth_token', $token, 60 * 24 * 7, '/', null, false, true);
// Parameters: name, value, minutes (7 days), path, domain, secure, httpOnly
```

**On Register (Line 41):**
```php
// Set secure HTTP-only cookie for SPA
$response->cookie('auth_token', $token, 60 * 24 * 7, '/', null, false, true);
```

**On Logout (Line 95):**
```php
// Clear auth cookie
$response->cookie('auth_token', '', -1, '/', null, false, true);
```

**Cookie Properties:**
- **Name:** `auth_token`
- **Value:** Laravel Sanctum token (plain text token)
- **Expiration:** 7 days (60 * 24 * 7 minutes)
- **Path:** `/` (available site-wide)
- **Secure:** `false` (set to `true` in production with HTTPS)
- **HttpOnly:** `true` (JavaScript cannot access - prevents XSS)
- **SameSite:** Default (Lax)

#### **Backend: Cookie Encryption**
📍 **File:** `UAS/uas-backend/app/Http/Middleware/EncryptCookies.php`

```php
protected $except = [
    // auth_token is encrypted by default (not in $except array)
];
```

**Note:** Laravel automatically encrypts cookies except those listed in `$except`. Since `auth_token` is not listed, it gets encrypted.

#### **Backend: CORS Configuration**
📍 **File:** `UAS/uas-backend/config/cors.php`

```php
'supports_credentials' => true,  // Allows cookies to be sent cross-origin
'allowed_origins' => [
    'http://localhost:4200',     // Frontend URL
    // ...
],
```

#### **Backend: Sanctum Configuration**
📍 **File:** `UAS/uas-backend/config/sanctum.php`

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 
    'localhost,localhost:4200,127.0.0.1,127.0.0.1:8000,::1'
)),
```

This tells Sanctum which domains should receive stateful (cookie-based) authentication.

#### **Frontend: Sending Cookies**
📍 **File:** `UAS/uas-frontend/src/app/services/auth.service.ts`

**All HTTP requests include cookies (Lines 59, 77, 95, 114):**
```typescript
{ withCredentials: true }  // Tells browser to send cookies with request
```

**Example - Login (Line 73-78):**
```typescript
login(username: string, password: string): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(
    `${this.apiUrl}/auth/login`,
    { username, password },
    { withCredentials: true }  // ← Sends cookies automatically
  )
}
```

#### **Frontend: HTTP Interceptor**
📍 **File:** `UAS/uas-frontend/src/app/interceptors/auth.interceptor.ts`

**Line 38:** Ensures all requests include cookies:
```typescript
let clonedRequest = request.clone({
  setHeaders: {},
  withCredentials: true  // ← Important for cookie-based auth
});
```

**Line 32-33:** Also adds Bearer token as fallback:
```typescript
// Get token from localStorage (fallback - cookie is primary)
const token = this.authService.getToken();
```

#### **Frontend: Token Backup (Fallback)**
📍 **File:** `UAS/uas-frontend/src/app/services/auth.service.ts`

**Line 159:** Stores token in localStorage as backup:
```typescript
// Store token in localStorage as fallback (cookie is primary)
localStorage.setItem('auth_token', token);
```

**Why?** In case cookies are disabled or blocked, the app can still authenticate using the Authorization header.

**Line 192-194:** Retrieves token from localStorage:
```typescript
getToken(): string | null {
  return localStorage.getItem('auth_token');
}
```

#### **Frontend: App Configuration**
📍 **File:** `UAS/uas-frontend/src/app/app.config.ts`

**Line 17-18:** Configures HTTP client to support cookies:
```typescript
provideHttpClient(
  withFetch(),
  withInterceptorsFromDi()  // Enables AuthInterceptor
)
```

---

## 2. Remember Username Cookie (`remember_username`)

### Purpose
Stores username for convenience (not security-sensitive).

### How It Works

#### **Frontend: Cookie Management**
📍 **File:** `UAS/uas-frontend/src/app/components/login/login.ts`

**Reading Cookie (Lines 31, 44-47):**
```typescript
// Load remembered user if exists
const rememberedUsername = this.getCookie('remember_username');
if (rememberedUsername) {
  this.loginForm.patchValue({
    username: rememberedUsername,
    rememberMe: true
  });
}

private getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
```

**Setting Cookie (Line 62):**
```typescript
if (rememberMe) {
  document.cookie = `remember_username=${encodeURIComponent(username)}; path=/; max-age=604800; SameSite=Lax`;
  // 604800 seconds = 7 days
}
```

**Clearing Cookie (Line 64):**
```typescript
else {
  document.cookie = "remember_username=; Max-Age=0; path=/;";
}
```

**Cookie Properties:**
- **Name:** `remember_username`
- **Value:** Encoded username
- **Expiration:** 7 days (604800 seconds)
- **Path:** `/`
- **HttpOnly:** `false` (JavaScript can access)
- **SameSite:** `Lax`

---

## Cookie Storage Locations Summary

| Cookie Name | Set By | Storage Location | HttpOnly | Encrypted | Purpose |
|------------|--------|------------------|----------|-----------|---------|
| `auth_token` | Backend (Laravel) | Browser Cookie Storage | ✅ Yes | ✅ Yes (Laravel) | Primary authentication |
| `auth_token` (backup) | Frontend (Angular) | localStorage | ❌ No | ❌ No | Fallback authentication |
| `remember_username` | Frontend (Angular) | Browser Cookie Storage | ❌ No | ❌ No | User convenience |

---

## Cookie Flow Diagram

### Login Flow:
```
1. User submits login form
   ↓
2. Frontend sends POST to /api/auth/login
   (withCredentials: true)
   ↓
3. Backend validates credentials
   ↓
4. Backend creates Sanctum token
   ↓
5. Backend sets HTTP-only cookie: auth_token
   ↓
6. Backend returns response with cookie
   ↓
7. Browser automatically stores cookie
   ↓
8. Frontend stores token in localStorage (backup)
   ↓
9. Future requests automatically include cookie
```

### Request Flow:
```
1. Frontend makes API request
   ↓
2. AuthInterceptor adds withCredentials: true
   ↓
3. Browser automatically includes auth_token cookie
   ↓
4. Backend receives cookie
   ↓
5. Laravel decrypts cookie
   ↓
6. Sanctum validates token from cookie
   ↓
7. Request is authenticated
```

---

## Key Files Reference

### Backend Files:
1. **`UAS/uas-backend/app/Http/Controllers/AuthController.php`**
   - Sets `auth_token` cookie on login/register
   - Clears cookie on logout

2. **`UAS/uas-backend/app/Http/Middleware/EncryptCookies.php`**
   - Handles cookie encryption/decryption

3. **`UAS/uas-backend/config/cors.php`**
   - Configures CORS to allow credentials (cookies)

4. **`UAS/uas-backend/config/sanctum.php`**
   - Configures stateful domains for cookie-based auth

### Frontend Files:
1. **`UAS/uas-frontend/src/app/services/auth.service.ts`**
   - Sends requests with `withCredentials: true`
   - Stores token in localStorage as backup
   - Handles authentication state

2. **`UAS/uas-frontend/src/app/interceptors/auth.interceptor.ts`**
   - Adds `withCredentials: true` to all requests
   - Adds Authorization header as fallback

3. **`UAS/uas-frontend/src/app/components/login/login.ts`**
   - Manages `remember_username` cookie
   - Reads/writes cookie using `document.cookie`

4. **`UAS/uas-frontend/src/app/app.config.ts`**
   - Configures HTTP client with interceptors

---

## Security Notes

1. **HTTP-Only Cookie:** `auth_token` is HTTP-only, so JavaScript cannot access it (prevents XSS attacks)

2. **Cookie Encryption:** Laravel automatically encrypts cookies, so the token value is encrypted in the browser

3. **SameSite Attribute:** Cookies use `Lax` by default, preventing CSRF attacks

4. **CORS with Credentials:** `supports_credentials: true` allows cookies to be sent cross-origin (only to allowed origins)

5. **Fallback Token:** localStorage token is used as fallback but is less secure (accessible to JavaScript)

---

## Testing Cookies

### Check if cookies are set:
1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Cookies** → `http://localhost:4200`
4. You should see:
   - `auth_token` (if logged in)
   - `remember_username` (if "Remember Me" was checked)

### Verify cookie is sent:
1. Open DevTools → **Network** tab
2. Make an API request
3. Click on the request
4. Check **Headers** → **Request Headers**
5. Look for: `Cookie: auth_token=...`

---

**Last Updated:** December 2024

