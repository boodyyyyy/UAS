# UAS Backend API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All protected routes require authentication using Laravel Sanctum. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

## Endpoints

### Authentication

#### Register
```
POST /api/register
```
**Body:**
```json
{
  "username": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "admin|accounting|student"
}
```

#### Login
```
POST /api/login
```
**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

#### Logout
```
POST /api/logout
```
**Headers:** Authorization: Bearer {token}

#### Get Current User
```
GET /api/me
```
**Headers:** Authorization: Bearer {token}

---

### Invoices

#### Get All Invoices
```
GET /api/invoices?status=pending&student_id=1
```
**Headers:** Authorization: Bearer {token}
**Query Parameters:**
- `status` (optional): pending, paid, overdue, cancelled
- `student_id` (optional): Filter by student (admin/accountant only)

#### Get Single Invoice
```
GET /api/invoices/{id}
```
**Headers:** Authorization: Bearer {token}

#### Create Invoice (Admin/Accountant)
```
POST /api/invoices
```
**Headers:** Authorization: Bearer {token}
**Body:**
```json
{
  "student_id": 1,
  "description": "Tuition Fee - Fall 2024",
  "amount": 5000.00,
  "issue_date": "2024-01-01",
  "due_date": "2024-02-01"
}
```

#### Update Invoice Status (Admin/Accountant)
```
PATCH /api/invoices/{id}/status
```
**Headers:** Authorization: Bearer {token}
**Body:**
```json
{
  "status": "paid"
}
```

#### Delete Invoice (Admin)
```
DELETE /api/invoices/{id}
```
**Headers:** Authorization: Bearer {token}

---

### Payments

#### Get All Payments
```
GET /api/payments?status=completed&invoice_id=1
```
**Headers:** Authorization: Bearer {token}
**Query Parameters:**
- `status` (optional): pending, completed, failed, refunded
- `invoice_id` (optional): Filter by invoice

#### Get Single Payment
```
GET /api/payments/{id}
```
**Headers:** Authorization: Bearer {token}

#### Create Payment
```
POST /api/payments
```
**Headers:** Authorization: Bearer {token}
**Body:**
```json
{
  "invoice_id": 1,
  "amount": 5000.00,
  "method": "credit_card",
  "payment_date": "2024-01-15",
  "description": "Payment for tuition"
}
```

#### Update Payment Status (Admin/Accountant)
```
PATCH /api/payments/{id}/status
```
**Headers:** Authorization: Bearer {token}
**Body:**
```json
{
  "status": "completed"
}
```

---

### Payrolls (Admin/Accountant Only)

#### Get All Payrolls
```
GET /api/payrolls?staff_id=1&pay_period=October 2024
```
**Headers:** Authorization: Bearer {token}

#### Get Single Payroll
```
GET /api/payrolls/{id}
```
**Headers:** Authorization: Bearer {token}

#### Create Payroll
```
POST /api/payrolls
```
**Headers:** Authorization: Bearer {token}
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

#### Generate Payroll Report
```
POST /api/payrolls/report
```
**Headers:** Authorization: Bearer {token}
**Body:**
```json
{
  "period": "October 2024"
}
```

---

### Budgets

#### Get All Budgets
```
GET /api/budgets?department_id=1&fiscal_year=2024
```
**Headers:** Authorization: Bearer {token}

#### Get Single Budget
```
GET /api/budgets/{id}
```
**Headers:** Authorization: Bearer {token}

#### Create/Update Budget (Admin/Accountant)
```
POST /api/budgets
```
**Headers:** Authorization: Bearer {token}
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
    }
  ]
}
```

#### Add Budget Transaction (Admin/Accountant)
```
POST /api/budgets/transactions
```
**Headers:** Authorization: Bearer {token}
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

---

### Student Fees

#### Get All Student Fees
```
GET /api/student-fees?status=pending
```
**Headers:** Authorization: Bearer {token}

#### Create Student Fee (Admin/Accountant)
```
POST /api/student-fees
```
**Headers:** Authorization: Bearer {token}
**Body:**
```json
{
  "student_id": 1,
  "description": "Tuition Fee",
  "amount": 5000.00,
  "due_date": "2024-02-01"
}
```

#### Update Student Fee Status (Admin/Accountant)
```
PATCH /api/student-fees/{id}/status
```
**Headers:** Authorization: Bearer {token}
**Body:**
```json
{
  "status": "paid",
  "payment_date": "2024-01-15"
}
```

---

### Users

#### Get All Users (Admin Only)
```
GET /api/users?role=student&is_active=1
```
**Headers:** Authorization: Bearer {token}

#### Get Single User
```
GET /api/users/{id}
```
**Headers:** Authorization: Bearer {token}

#### Update User
```
PATCH /api/users/{id}
```
**Headers:** Authorization: Bearer {token}
**Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "picture": "url_to_picture"
}
```

#### Delete User (Admin Only)
```
DELETE /api/users/{id}
```
**Headers:** Authorization: Bearer {token}

---

### Departments

#### Get All Departments
```
GET /api/departments
```
**Headers:** Authorization: Bearer {token}

#### Get Single Department
```
GET /api/departments/{id}
```
**Headers:** Authorization: Bearer {token}

#### Create Department (Admin Only)
```
POST /api/departments
```
**Headers:** Authorization: Bearer {token}
**Body:**
```json
{
  "name": "Computer Science",
  "code": "CS",
  "description": "Department of Computer Science"
}
```

---

### Reports (Admin/Accountant Only)

#### Financial Summary
```
GET /api/reports/financial-summary?start_date=2024-01-01&end_date=2024-12-31
```
**Headers:** Authorization: Bearer {token}

#### Department Budgets Report
```
GET /api/reports/department-budgets?fiscal_year=2024
```
**Headers:** Authorization: Bearer {token}

---

## Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

## Role-Based Access

- **Admin**: Full access to all endpoints
- **Accountant**: Access to invoices, payments, payrolls, budgets, reports (read/write)
- **Student**: Read-only access to own invoices, payments, and fees

