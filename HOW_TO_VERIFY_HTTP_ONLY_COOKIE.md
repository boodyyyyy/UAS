# How to Verify HTTP-Only Cookie

This guide shows you multiple ways to verify that the `auth_token` cookie is stored as HTTP-only.

## Method 1: Browser DevTools (Easiest)

### Chrome/Edge:

1. **Open your application** and log in
2. **Open DevTools** (F12 or Right-click → Inspect)
3. **Go to Application tab** (Chrome) or **Storage tab** (Firefox)
4. **Navigate to:** Application → Cookies → `http://localhost:4200`
5. **Look for `auth_token` cookie**
6. **Check the columns:**
   - **HttpOnly** column should show ✅ or `✓`
   - **Secure** column (should be empty for localhost, ✓ for HTTPS)
   - **SameSite** column (should show `Lax` or `None`)

**What you should see:**
```
Name: auth_token
Value: [encrypted token - you won't see the actual value]
Domain: localhost
Path: /
Expires: [7 days from now]
Size: [token size]
HttpOnly: ✓  ← This confirms it's HTTP-only
Secure: (empty for localhost)
SameSite: Lax
```

### Firefox:

1. **Open DevTools** (F12)
2. **Go to Storage tab**
3. **Click Cookies** → `http://localhost:4200`
4. **Look for `auth_token`**
5. **Check the "HttpOnly" column** - should show `true` or `✓`

---

## Method 2: JavaScript Console Test (Most Reliable)

HTTP-only cookies **cannot** be accessed via JavaScript. This is the security feature.

### Test in Browser Console:

1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Type this command:**
   ```javascript
   document.cookie
   ```

### Expected Results:

**If cookie is HTTP-only (CORRECT):**
```javascript
// You will see:
"remember_username=someuser"  // Only non-HTTP-only cookies appear
// auth_token is NOT visible - this confirms it's HTTP-only!
```

**If cookie is NOT HTTP-only (WRONG - security issue):**
```javascript
// You would see:
"auth_token=abc123...; remember_username=someuser"
// If you see auth_token here, it's NOT HTTP-only (security risk!)
```

### Test Script:

Run this in the console after logging in:

```javascript
// Check all cookies
console.log('All accessible cookies:', document.cookie);

// Try to access auth_token directly (will fail if HTTP-only)
const cookies = document.cookie.split(';');
const authCookie = cookies.find(c => c.trim().startsWith('auth_token='));
console.log('auth_token accessible:', authCookie ? 'NO (Security Risk!)' : 'YES (HTTP-only - Secure!)');
```

**Expected output if HTTP-only:**
```
All accessible cookies: remember_username=someuser
auth_token accessible: YES (HTTP-only - Secure!)
```

---

## Method 3: Network Tab - Check Request Headers

This shows cookies being sent automatically by the browser.

### Steps:

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Make any API request** (e.g., navigate to dashboard)
4. **Click on the request** (e.g., `/api/auth/me` or `/api/...`)
5. **Go to Headers section**
6. **Look for "Request Headers"**

### What to Look For:

**In Request Headers, you should see:**
```
Cookie: auth_token=eyJ0eXAiOiJKV1QiLCJhbGc...; remember_username=someuser
```

**Important:** 
- The cookie is **automatically sent** by the browser
- You don't see it in JavaScript (`document.cookie`)
- This confirms it's HTTP-only and working correctly

### Check Response Headers (When Cookie is Set):

1. **Go to Network tab**
2. **Find the login request** (`POST /api/auth/login`)
3. **Click on it**
4. **Go to Headers → Response Headers**
5. **Look for `Set-Cookie` header:**

```
Set-Cookie: auth_token=eyJ0eXAiOiJKV1QiLCJhbGc...; expires=...; Max-Age=604800; path=/; httponly
```

**Key indicators:**
- `httponly` at the end confirms HTTP-only
- `path=/` shows it's available site-wide
- `Max-Age=604800` shows 7-day expiration

---

## Method 4: Backend Code Verification

Check the code that sets the cookie to confirm HTTP-only flag.

### File: `UAS/uas-backend/app/Http/Controllers/AuthController.php`

**Line 78 (Login):**
```php
$response->cookie('auth_token', $token, 60 * 24 * 7, '/', null, false, true);
//                                                                      ↑    ↑
//                                                              Secure  HttpOnly
//                                                              (false) (true)
```

**Parameters breakdown:**
```php
cookie(
    'auth_token',        // Name
    $token,              // Value
    60 * 24 * 7,         // Expiration (minutes) = 7 days
    '/',                 // Path
    null,                // Domain
    false,               // Secure (false = works on HTTP, true = HTTPS only)
    true                 // HttpOnly (true = HTTP-only, false = accessible to JS)
);
```

**✅ If the last parameter is `true`, the cookie is HTTP-only!**

---

## Method 5: Using Browser Extensions

### Chrome Extension: "EditThisCookie" or "Cookie-Editor"

1. **Install extension** from Chrome Web Store
2. **Open extension** after logging in
3. **Look for `auth_token` cookie**
4. **Check the "HttpOnly" property** - should be `true` or checked

---

## Method 6: Programmatic Check (For Testing)

Create a test endpoint or use existing one to verify.

### Backend Test Route (Optional):

Add this to `routes/web.php` for testing:

```php
Route::get('/test-cookie', function (Request $request) {
    $cookie = $request->cookie('auth_token');
    return response()->json([
        'cookie_exists' => !is_null($cookie),
        'cookie_value' => $cookie ? 'exists (encrypted)' : null,
        'is_http_only' => 'Check via browser DevTools - cannot be verified server-side',
    ]);
});
```

Then check in browser:
- Cookie is sent automatically (Network tab)
- Cookie is NOT accessible via JavaScript (Console)

---

## Quick Verification Checklist

After logging in, verify:

- [ ] **DevTools → Application → Cookies** shows `auth_token` with HttpOnly ✓
- [ ] **Console → `document.cookie`** does NOT show `auth_token`
- [ ] **Network tab → Request Headers** shows `Cookie: auth_token=...`
- [ ] **Network tab → Response Headers** (login) shows `Set-Cookie: ... httponly`
- [ ] **Backend code** has `cookie(..., true)` as last parameter

---

## What If Cookie is NOT HTTP-Only?

### Security Risk:
If `auth_token` appears in `document.cookie`, it's vulnerable to XSS attacks!

### How to Fix:

**Backend:** Ensure last parameter is `true`:
```php
// ✅ CORRECT (HTTP-only)
$response->cookie('auth_token', $token, 60 * 24 * 7, '/', null, false, true);

// ❌ WRONG (Not HTTP-only - security risk!)
$response->cookie('auth_token', $token, 60 * 24 * 7, '/', null, false, false);
```

**File to check:** `UAS/uas-backend/app/Http/Controllers/AuthController.php`
- Line 41 (Register)
- Line 78 (Login)

Both should have `true` as the last parameter.

---

## Visual Guide

### ✅ Correct (HTTP-Only):
```
Browser DevTools → Application → Cookies:
┌─────────────────────────────────────────┐
│ Name: auth_token                        │
│ Value: [encrypted]                      │
│ HttpOnly: ✓                             │ ← Confirmed!
│ Secure: (empty)                         │
│ SameSite: Lax                           │
└─────────────────────────────────────────┘

Console:
> document.cookie
"remember_username=user"  ← auth_token NOT visible
```

### ❌ Wrong (Not HTTP-Only):
```
Console:
> document.cookie
"auth_token=abc123; remember_username=user"  ← Security risk!
```

---

## Summary

**The easiest way to verify:**
1. Log in to your application
2. Open DevTools (F12)
3. Go to **Application** tab → **Cookies** → `http://localhost:4200`
4. Find `auth_token` cookie
5. Check if **HttpOnly** column shows ✓ or `true`

**OR**

1. Open Console tab
2. Type `document.cookie`
3. If `auth_token` is **NOT** in the output, it's HTTP-only ✅

---

**Last Updated:** December 2024

