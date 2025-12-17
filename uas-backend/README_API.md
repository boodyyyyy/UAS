# UAS REST API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All protected routes require authentication using Laravel Sanctum. Include the token in the Authorization header:

```
Authorization: Bearer {token}
```

The token is returned in the `meta.token` field after successful login or registration.

## Response Format

All API responses follow a consistent JSON structure:

**Success Response:**
```json
{
  "data": { ... },
  "meta": { ... },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "message": "Error message",
  "errors": { ... }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error
- `503` - Service Unavailable (health check)

## Pagination

List endpoints support pagination with the following query parameters:
- `per_page` - Items per page (default: 15)
- `page` - Page number (default: 1)

Pagination metadata is included in the `meta` field:
```json
{
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75
  }
}
```

---

## Public Endpoints

### Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Authentication Endpoints

### Register
```
POST /api/auth/register
```
**Body:**
```json
{
  "username": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "student"
}
```
**Response:** `201 Created`
```json
{
  "data": {
    "id": 1,
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "token": "1|abc123..."
  },
  "message": "User registered successfully"
}
```

### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```
**Response:** `200 OK` (same structure as register)

### Logout
```
POST /api/auth/logout
```
**Headers:** `Authorization: Bearer {token}`
**Response:** `200 OK`

### Get Current User
```
GET /api/auth/me
```
**Headers:** `Authorization: Bearer {token}`
**Response:** `200 OK`

---

## User Profile Endpoints

### List Users (Admin Only)
```
GET /api/users?role=student&is_active=1&search=john&per_page=15&page=1
```
**Query Parameters:**
- `role` - Filter by role (admin, accounting, student)
- `is_active` - Filter by active status (true/false)
- `search` - Search by name, email, or username
- `per_page` - Items per page
- `page` - Page number

**Response:** `200 OK` (paginated)

### Get User
```
GET /api/users/{id}
```
**Access:** Admin or self
**Response:** `200 OK`

### Create User (Admin Only)
```
POST /api/users
```
**Body:**
```json
{
  "username": "janedoe",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "accounting",
  "picture": "https://example.com/avatar.jpg"
}
```
**Response:** `201 Created`

### Update User
```
PUT /api/users/{id}
PATCH /api/users/{id}
```
**Access:** Admin or self (role changes admin only)
**Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "picture": "https://example.com/new-avatar.jpg",
  "role": "admin",
  "is_active": true
}
```
**Response:** `200 OK`

### Update Password
```
PUT /api/users/{id}/password
```
**Access:** Admin or self
**Body:**
```json
{
  "current_password": "oldpassword",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```
**Response:** `200 OK`

### Delete User (Admin Only)
```
DELETE /api/users/{id}
```
**Response:** `200 OK`

---

## Invoice Endpoints

### List Invoices
```
GET /api/invoices?status=pending&student_id=1&start_date=2024-01-01&end_date=2024-12-31&per_page=15
```
**Query Parameters:**
- `status` - Filter by status (pending, paid, overdue, cancelled)
- `student_id` - Filter by student (admin/accountant only)
- `start_date` - Filter by issue date from
- `end_date` - Filter by issue date to
- `due_start_date` - Filter by due date from
- `due_end_date` - Filter by due date to
- `per_page` - Items per page
- `page` - Page number

**Access:** 
- Admin/Accountant: All invoices
- Student: Own invoices only

**Response:** `200 OK` (paginated)

### Get Invoice
```
GET /api/invoices/{id}
```
**Access:** 
- Admin/Accountant: Any invoice
- Student: Own invoices only

**Response:** `200 OK`

### Create Invoice (Admin/Accountant Only)
```
POST /api/invoices
```
**Body:**
```json
{
  "student_id": 1,
  "description": "Tuition Fee - Fall 2024",
  "amount": 5000.00,
  "issue_date": "2024-01-01",
  "due_date": "2024-02-01",
  "status": "pending"
}
```
**Response:** `201 Created`

### Update Invoice (Admin/Accountant Only)
```
PUT /api/invoices/{id}
PATCH /api/invoices/{id}
```
**Body:** (all fields optional)
```json
{
  "student_id": 1,
  "description": "Updated description",
  "amount": 5500.00,
  "issue_date": "2024-01-01",
  "due_date": "2024-02-15",
  "status": "paid"
}
```
**Response:** `200 OK`

### Delete Invoice (Admin/Accountant Only)
```
DELETE /api/invoices/{id}
```
**Response:** `200 OK`

### Pay Invoice (Student Only)
```
POST /api/invoices/{id}/pay
```
**Body:**
```json
{
  "amount": 5000.00,
  "method": "credit_card",
  "payment_date": "2024-01-15",
  "description": "Payment for tuition"
}
```
**Response:** `201 Created`
- Creates a payment record with status "pending"
- Prevents overpayment (validates remaining amount)
- Uses database transaction for safety

---

## Payment Endpoints

### List Payments
```
GET /api/payments?status=completed&invoice_id=1&student_id=1&start_date=2024-01-01&end_date=2024-12-31
```
**Query Parameters:**
- `status` - Filter by status (pending, completed, failed, refunded)
- `invoice_id` - Filter by invoice
- `student_id` - Filter by student (admin/accountant only)
- `start_date` - Filter by payment date from
- `end_date` - Filter by payment date to
- `per_page` - Items per page
- `page` - Page number

**Access:**
- Admin/Accountant: All payments
- Student: Own payments only

**Response:** `200 OK` (paginated)

### Get Payment
```
GET /api/payments/{id}
```
**Access:**
- Admin/Accountant: Any payment
- Student: Own payments only

**Response:** `200 OK`

### Create Payment (Admin/Accountant Only)
```
POST /api/payments
```
**Body:**
```json
{
  "invoice_id": 1,
  "amount": 5000.00,
  "method": "bank_transfer",
  "payment_date": "2024-01-15",
  "description": "Manual payment recording",
  "status": "completed"
}
```
**Response:** `201 Created`
- Automatically updates invoice status if fully paid
- Prevents overpayment
- Uses database transaction for safety

### Update Payment Status (Admin/Accountant Only)
```
PATCH /api/payments/{id}/status
```
**Body:**
```json
{
  "status": "completed"
}
```
**Response:** `200 OK`
- Automatically updates invoice status when payment is completed

---

## Department Endpoints

### List Departments
```
GET /api/departments?search=computer&per_page=15
```
**Query Parameters:**
- `search` - Search by name or code
- `per_page` - Items per page
- `page` - Page number

**Access:** All authenticated users

**Response:** `200 OK` (paginated)

### Get Department
```
GET /api/departments/{id}
```
**Access:** All authenticated users

**Response:** `200 OK`

### Create Department (Admin Only)
```
POST /api/departments
```
**Body:**
```json
{
  "name": "Computer Science",
  "code": "CS",
  "description": "Department of Computer Science"
}
```
**Response:** `201 Created`

### Update Department (Admin Only)
```
PUT /api/departments/{id}
PATCH /api/departments/{id}
```
**Response:** `200 OK`

### Delete Department (Admin Only)
```
DELETE /api/departments/{id}
```
**Response:** `200 OK`

---

## Budget Endpoints

### List Budgets
```
GET /api/budgets?department_id=1&fiscal_year=2024&per_page=15
```
**Query Parameters:**
- `department_id` - Filter by department
- `fiscal_year` - Filter by fiscal year
- `per_page` - Items per page
- `page` - Page number

**Access:** Admin/Accountant

**Response:** `200 OK` (paginated)

### Get Budget
```
GET /api/budgets/{id}
```
**Access:** Admin/Accountant

**Response:** `200 OK`

### Create/Update Budget (Admin/Accountant Only)
```
POST /api/budgets
```
**Body:**
```json
{
  "department_id": 1,
  "fiscal_year": "2024",
  "total_budget": 500000.00,
  "categories": [
    {
      "name": "Salaries",
      "allocated": 300000.00,
      "spent": 250000.00
    },
    {
      "name": "Equipment",
      "allocated": 100000.00,
      "spent": 50000.00
    }
  ]
}
```
**Response:** `201 Created`
- Creates new budget or updates existing one for department/fiscal year

### Update Budget (Admin/Accountant Only)
```
PUT /api/budgets/{id}
PATCH /api/budgets/{id}
```
**Response:** `200 OK`

### Delete Budget (Admin Only)
```
DELETE /api/budgets/{id}
```
**Response:** `200 OK`

### Add Budget Transaction (Admin/Accountant Only)
```
POST /api/budgets/transactions
```
**Body:**
```json
{
  "department_budget_id": 1,
  "budget_category_id": 1,
  "transaction_date": "2024-01-15",
  "description": "Monthly salary payment",
  "category_name": "Salaries",
  "amount": 50000.00,
  "type": "expense",
  "status": "completed"
}
```
**Response:** `201 Created`
- Automatically updates budget totals and category balances

---

## Payroll Endpoints (Admin/Accountant Only)

### List Payrolls
```
GET /api/payrolls?staff_id=1&pay_period=October 2024&start_date=2024-01-01&end_date=2024-12-31
```
**Query Parameters:**
- `staff_id` - Filter by staff
- `pay_period` - Filter by pay period
- `start_date` - Filter by pay date from
- `end_date` - Filter by pay date to
- `per_page` - Items per page
- `page` - Page number

**Response:** `200 OK` (paginated)

### Get Payroll
```
GET /api/payrolls/{id}
```
**Response:** `200 OK`

### Create Payroll
```
POST /api/payrolls
```
**Body:**
```json
{
  "staff_id": 1,
  "gross_pay": 6250.00,
  "allowances": 500.00,
  "deductions": 1200.00,
  "pay_period": "October 2024",
  "pay_date": "2024-10-15"
}
```
**Response:** `201 Created`
- Net pay is automatically calculated

### Generate Payroll Report
```
POST /api/payrolls/report
```
**Body:**
```json
{
  "period": "October 2024"
}
```
**Response:** `200 OK`
```json
{
  "data": {
    "period": "October 2024",
    "totalPayrollCost": 50000.00,
    "employeesPaid": 10,
    "averageNetPay": 5000.00,
    "payrolls": [ ... ]
  },
  "message": "Payroll report generated successfully"
}
```

---

## Student Fee Endpoints

### List Student Fees
```
GET /api/student-fees?status=pending&per_page=15
```
**Query Parameters:**
- `status` - Filter by status (pending, paid, overdue)
- `per_page` - Items per page
- `page` - Page number

**Access:**
- Admin/Accountant: All fees
- Student: Own fees only

**Response:** `200 OK` (paginated)

### Create Student Fee (Admin/Accountant Only)
```
POST /api/student-fees
```
**Body:**
```json
{
  "student_id": 1,
  "description": "Tuition Fee",
  "amount": 5000.00,
  "due_date": "2024-02-01"
}
```
**Response:** `201 Created`

### Update Student Fee Status (Admin/Accountant Only)
```
PATCH /api/student-fees/{id}/status
```
**Body:**
```json
{
  "status": "paid",
  "payment_date": "2024-01-15"
}
```
**Response:** `200 OK`

---

## Report Endpoints (Admin/Accountant Only)

### Financial Summary
```
GET /api/reports/financial-summary?start_date=2024-01-01&end_date=2024-12-31
```
**Query Parameters:**
- `start_date` - Start date (default: start of current month)
- `end_date` - End date (default: end of current month)

**Response:** `200 OK`
```json
{
  "data": {
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-12-31"
    },
    "invoices": {
      "total": 100,
      "total_amount": 500000.00,
      "paid": 80,
      "paid_amount": 400000.00,
      "pending": 15,
      "pending_amount": 75000.00,
      "overdue": 5,
      "overdue_amount": 25000.00
    },
    "payments": {
      "total": 85,
      "total_amount": 425000.00
    },
    "payroll": {
      "total_amount": 200000.00,
      "count": 20
    },
    "net_income": 225000.00
  },
  "message": "Financial summary retrieved successfully"
}
```

### Department Budgets Report
```
GET /api/reports/department-budgets?fiscal_year=2024
```
**Query Parameters:**
- `fiscal_year` - Fiscal year (default: current year)

**Response:** `200 OK`

---

## Role-Based Access Control

### Student
- ✅ View own profile
- ✅ View own invoices
- ✅ View own payment history
- ✅ Create payment request for own invoices (`POST /api/invoices/{id}/pay`)
- ❌ Cannot create/update/delete invoices
- ❌ Cannot access payroll
- ❌ Cannot access budgets (except own fees)
- ❌ Cannot access reports

### Accounting
- ✅ CRUD invoices
- ✅ Record manual payments for any student invoice
- ✅ View department budgets
- ✅ View reports
- ✅ Manage payrolls
- ❌ Cannot manage users (except own profile)
- ❌ Cannot create/delete departments

### Admin
- ✅ Full access to everything
- ✅ User management (CRUD)
- ✅ Department management (CRUD)
- ✅ All accounting endpoints

---

## Error Handling

### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Unauthorized (401)
```json
{
  "message": "Unauthenticated."
}
```

### Forbidden (403)
```json
{
  "message": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "message": "No query results for model [App\\Models\\Invoice] 999"
}
```

---

## Angular Integration

### Setup

1. **Configure Base URL** in `environment.ts`:
```typescript
export const environment = {
  apiUrl: 'http://localhost:8000/api',
  // ...
};
```

2. **Create HTTP Interceptor** for authentication:
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(req);
  }
}
```

3. **Service Example**:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, {
      username,
      password
    });
  }

  getInvoices(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/invoices`, { params });
  }

  createInvoice(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/invoices`, data);
  }
}
```

4. **Store Token** after login:
```typescript
this.apiService.login(username, password).subscribe({
  next: (response) => {
    localStorage.setItem('auth_token', response.meta.token);
    // Store user data
    this.userService.setUser(response.data);
  },
  error: (error) => {
    console.error('Login failed:', error);
  }
});
```

### Handling Pagination

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message: string;
}

// Usage
this.apiService.getInvoices({ page: 1, per_page: 15 }).subscribe({
  next: (response: PaginatedResponse<Invoice>) => {
    this.invoices = response.data;
    this.pagination = response.meta;
  }
});
```

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Get Invoices
```bash
curl -X GET http://localhost:8000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Invoice
```bash
curl -X POST http://localhost:8000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "description": "Tuition Fee",
    "amount": 5000.00,
    "issue_date": "2024-01-01",
    "due_date": "2024-02-01"
  }'
```

---

## Notes

- All dates should be in `YYYY-MM-DD` format
- All monetary amounts are in decimal format (e.g., `5000.00`)
- Payment methods: `credit_card`, `debit_card`, `bank_transfer`, `ach_transfer`
- Invoice statuses: `pending`, `paid`, `overdue`, `cancelled`
- Payment statuses: `pending`, `completed`, `failed`, `refunded`
- User roles: `admin`, `accounting`, `student`
- All timestamps are in ISO 8601 format
- Pagination defaults to 15 items per page

