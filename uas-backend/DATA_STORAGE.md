# Data Storage Strategy

This document explains what data is stored where in the UAS (University Accounting System) and the rationale behind each storage decision.

## Overview

The UAS uses a combination of server-side database storage, HTTP-only cookies for authentication, and minimal client-side storage for UI preferences. Security and data integrity are prioritized.

---

## Server-Side Storage (MySQL Database)

### What is Stored

All persistent business data is stored in the MySQL database:

1. **User Accounts**
   - Username, email, password (hashed), role, profile picture URL
   - Active/inactive status
   - Timestamps (created_at, updated_at)

2. **Student Data**
   - Student ID, department, phone, address, date of birth
   - Enrollment date, status (active/inactive/graduated/suspended)
   - Linked to user account via foreign key

3. **Staff Data**
   - Employee ID, department, position, salary
   - Hire date, status (active/inactive/terminated)
   - Linked to user account via foreign key

4. **Financial Data**
   - Invoices (student_id, amount, due_date, status, description)
   - Student Fees (same as invoices, displayed in student-facing interface)
   - Payments (invoice_id, amount, method, status, transaction_id)
   - Department budgets (fiscal_year, total_budget, total_spent)
   - Budget categories and transactions
   - Payroll records (staff_id, gross_pay, allowances, deductions, net_pay)
   
   **Note:** Student fees are stored in the same `invoices` table as invoices. This ensures:
   - Single source of truth for all invoice-related data
   - Synchronization with invoice drafts
   - Consistency between admin-created invoices and student-viewed fees

5. **Department Data**
   - Department name, code, description

### Why Server-Side

- **Security**: Sensitive financial and personal data must be protected
- **Data Integrity**: Centralized source of truth prevents inconsistencies
- **Audit Trail**: All transactions are logged with timestamps
- **Multi-User Access**: Multiple users can access the same data simultaneously
- **Backup & Recovery**: Database backups protect against data loss
- **Compliance**: Financial data must be stored securely for compliance

---

## Authentication Storage

### HTTP-Only Cookies (Primary Method)

**What is Stored:**
- Authentication token (`auth_token`) - Laravel Sanctum token

**Storage Details:**
- **Type**: HTTP-only cookie
- **Lifetime**: 7 days
- **Security**: HttpOnly flag prevents JavaScript access (XSS protection)
- **SameSite**: Lax (CSRF protection)
- **Path**: `/` (available across entire application)
- **Secure**: Set to `false` for localhost development, should be `true` in production with HTTPS

**Why HTTP-Only Cookies:**
- **XSS Protection**: JavaScript cannot access the token, preventing XSS attacks
- **Automatic Transmission**: Browser automatically sends cookies with requests
- **Server-Controlled**: Server creates and manages cookies, ensuring security
- **CSRF Protection**: SameSite attribute helps prevent CSRF attacks
- **No Client-Side Exposure**: Token never exposed in localStorage or JavaScript

### LocalStorage (Fallback/Backup)

**What is Stored:**
- Authentication token (`auth_token`) - Same token as cookie, stored as backup

**Why LocalStorage (as fallback):**
- **Redundancy**: Backup in case cookies are disabled or blocked
- **Bearer Token**: Used in Authorization header for API requests
- **Note**: This is a fallback mechanism. Primary authentication uses cookies.

**Security Consideration:**
- Token in localStorage is accessible to JavaScript (XSS risk)
- However, token is only used for API calls, not for sensitive operations
- Server validates token on every request
- Token can be revoked server-side if compromised

---

## Client-Side Storage (Browser)

### SessionStorage

**What is Stored:**
- `currentUserId` - Current logged-in user ID (legacy, being phased out)

**Why SessionStorage:**
- **Temporary**: Cleared when browser tab/window closes
- **Legacy Support**: Maintained for backward compatibility
- **Note**: This is being replaced by AuthService state management

### LocalStorage (Non-Sensitive Data)

**What is Stored:**
1. **Remember Username Cookie** (via cookie, not localStorage)
   - `remember_username` - Username for "Remember Me" feature
   - Stored as cookie (not localStorage) for consistency

2. **Profile Picture** (if uploaded)
   - `profile_picture_{userId}` - Base64 or URL of user's profile picture
   - **Note**: This is temporary client-side storage. In production, images should be stored server-side.

**Why LocalStorage for Non-Sensitive Data:**
- **User Experience**: Preferences persist across sessions
- **Performance**: Reduces server requests for static preferences
- **Non-Critical**: Data can be regenerated or fetched from server

---

## What is NOT Stored Client-Side

### Sensitive Data (Never Stored Client-Side)

1. **Passwords**: Never stored, only hashed on server
2. **Credit Card Numbers**: Not implemented, but would be server-side only
3. **Financial Transactions**: All stored server-side
4. **Personal Information**: Student/Staff data stored server-side
5. **Authentication Credentials**: Primary auth via HTTP-only cookies

### Why Not Client-Side

- **Security**: Client-side storage is vulnerable to XSS attacks
- **Data Integrity**: Client-side data can be manipulated
- **Privacy**: Sensitive data should not be accessible to client-side scripts
- **Compliance**: Financial data regulations require server-side storage

---

## Data Flow

### Authentication Flow

1. **Login/Register**:
   - User submits credentials to `/api/auth/login` or `/api/auth/register`
   - Server validates credentials
   - Server creates Sanctum token
   - Server sets HTTP-only cookie with token
   - Server returns token in response (stored in localStorage as backup)
   - Angular stores user data in memory (UserService)

2. **API Requests**:
   - Angular HTTP interceptor adds `Authorization: Bearer {token}` header
   - Browser automatically sends HTTP-only cookie
   - Server validates token from cookie or header
   - Server returns data

3. **Logout**:
   - Client calls `/api/auth/logout`
   - Server deletes token from database
   - Server clears cookie
   - Client clears localStorage and sessionStorage
   - Client clears in-memory user data

### Data Retrieval Flow

1. **Component Requests Data**:
   - Component calls ApiService method
   - ApiService makes HTTP request with credentials
   - Server validates authentication
   - Server queries database
   - Server returns JSON response
   - Component receives and displays data

2. **Data Updates**:
   - User submits form
   - Component calls ApiService update method
   - Server validates request and updates database
   - Server returns updated data
   - Component refreshes display

---

## Security Best Practices Implemented

1. **HTTP-Only Cookies**: Primary authentication method prevents XSS
2. **CSRF Protection**: SameSite cookie attribute and Laravel CSRF tokens
3. **Token Expiration**: Tokens can be revoked server-side
4. **Password Hashing**: Bcrypt hashing on server (never plain text)
5. **Role-Based Access**: Server enforces permissions, not just client
6. **Input Validation**: Server-side validation prevents malicious input
7. **SQL Injection Prevention**: Eloquent ORM uses parameterized queries

---

## Migration from Milestone 1

### Changes Made

1. **Removed Client-Side User Storage**:
   - Previously: Users array stored in localStorage
   - Now: Users stored in database, fetched from API

2. **Removed Client-Side Data Storage**:
   - Previously: Invoices, payments, budgets in localStorage
   - Now: All data fetched from API

3. **Cookie Initialization**:
   - Previously: Cookies set client-side
   - Now: Cookies set server-side (HTTP-only, secure)

4. **Authentication**:
   - Previously: Client-side validation
   - Now: Server-side validation with Sanctum

---

## Summary Table

| Data Type | Storage Location | Reason |
|-----------|-----------------|--------|
| User accounts | MySQL Database | Security, persistence, multi-user |
| Financial data | MySQL Database | Security, audit trail, compliance |
| Auth token (primary) | HTTP-only Cookie | XSS protection, automatic transmission |
| Auth token (backup) | LocalStorage | Fallback for API Authorization header |
| User preferences | LocalStorage | Non-sensitive, UX improvement |
| Current user (runtime) | In-memory (UserService) | Performance, temporary state |
| Remember username | Cookie | User convenience, non-sensitive |

---

## Recommendations for Production

1. **Enable HTTPS**: Set `Secure` flag on cookies
2. **Shorten Token Lifetime**: Reduce cookie expiration time
3. **Implement Token Refresh**: Add refresh token mechanism
4. **Server-Side Image Storage**: Move profile pictures to server/CDN
5. **Rate Limiting**: Implement API rate limiting
6. **Audit Logging**: Log all sensitive operations
7. **Regular Backups**: Automated database backups

---

## Conclusion

The UAS follows security best practices by:
- Storing all sensitive data server-side
- Using HTTP-only cookies for authentication
- Minimizing client-side storage
- Implementing proper access controls
- Validating all data server-side

This approach ensures data security, integrity, and compliance with financial data regulations.

