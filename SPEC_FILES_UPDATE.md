# Spec Files Update Summary

This document summarizes the changes made to test specification files to reflect the backend integration.

## Overview

When the backend was integrated, the application moved from client-side storage (localStorage) to server-side storage (database + API). The test files needed to be updated to reflect these architectural changes.

## Files Updated

### 1. `user.service.spec.ts`

**Changes:**
- Updated documentation to clarify that user data is now primarily stored in the database
- Removed `preferences` field from mock user (this feature was removed)
- Added `newsletterSubscribed` field to mock user (new feature)
- Updated comments to indicate localStorage is only used for legacy support and profile picture caching
- Added test for newsletter subscription field

**Key Updates:**
- Tests still validate localStorage functionality for legacy support
- Added note that primary user storage is now in the database

### 2. `signup.component.spec.ts`

**Changes:**
- Removed localStorage-based username validation tests (now handled by backend API)
- Removed preferences-related tests (feature removed)
- Updated to use `AuthService.register()` instead of direct localStorage manipulation
- Added `HttpClientTestingModule` for API testing
- Updated tests to mock API responses using `of()` and `throwError()` from RxJS
- Added test for API error handling

**Key Updates:**
- Registration now goes through `AuthService.register()` which calls the backend API
- Username uniqueness is validated by the backend, not frontend localStorage
- Tests now mock API responses instead of checking localStorage

### 3. `login.component.spec.ts`

**Changes:**
- Removed localStorage-based user lookup tests
- Updated to use `AuthService.login()` instead of localStorage validation
- Added `HttpClientTestingModule` for API testing
- Added `AuthService` spy for mocking API calls
- Updated tests to mock API responses
- Added test for API error handling

**Key Updates:**
- Login now goes through `AuthService.login()` which calls the backend API
- Credentials are validated by the backend, not frontend localStorage
- Tests now mock API responses instead of checking localStorage

## Testing Strategy Changes

### Before (Client-Side Storage)
```typescript
// Old approach: Direct localStorage manipulation
localStorage.setItem('users', JSON.stringify([...]));
const users = JSON.parse(localStorage.getItem('users') || '[]');
expect(users.length).toBe(2);
```

### After (Backend API)
```typescript
// New approach: Mock API service
authServiceSpy.login.and.returnValue(of(mockResponse));
expect(authServiceSpy.login).toHaveBeenCalledWith('username', 'password');
```

## What Still Uses localStorage?

The following still use localStorage for legacy support or caching:
- **Profile Pictures**: Cached in localStorage for quick access
- **Auth Token**: Stored as fallback (primary is HTTP-only cookie)
- **Remember Username**: Cookie-based, not localStorage

## Migration Notes

1. **User Registration**: Now uses `POST /api/auth/register` endpoint
2. **User Login**: Now uses `POST /api/auth/login` endpoint
3. **User Data**: Fetched from `GET /api/auth/me` or `GET /api/users/{id}`
4. **Username Validation**: Handled by backend API, not frontend
5. **Password Validation**: Handled by backend API, not frontend

## Running Tests

All tests should now pass with the backend integration:

```bash
cd uas-frontend
npm test
```

## Future Considerations

- Consider adding integration tests that test against a test database
- Consider adding E2E tests that test the full flow from frontend to backend
- Consider mocking the entire HTTP client instead of just the service layer

---

**Last Updated:** December 2024

