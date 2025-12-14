# University Accounting System - Laravel Backend

This is the Laravel backend for the University Accounting System (UAS) with support for admin, accountant, and student roles.

## Database Structure

The system includes the following tables:
- **users** - User accounts with roles (admin, accounting, student)
- **departments** - University departments
- **students** - Student information linked to users
- **staff** - Staff/employee information linked to users
- **invoices** - Student invoices
- **payments** - Payment transactions
- **department_budgets** - Department budget allocations
- **budget_categories** - Budget categories within departments
- **budget_transactions** - Budget transaction history
- **payrolls** - Staff payroll records

## Setup Instructions

### Prerequisites
- PHP 8.1 or higher
- Composer
- MySQL 5.7+ or MariaDB
- Node.js and NPM (for frontend)

### Installation

1. **Install Dependencies**
   ```bash
   composer install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env` (if not already done)
   - Update database credentials in `.env`:
     ```
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=uas_db
     DB_USERNAME=root
     DB_PASSWORD=your_password
     ```

3. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

4. **Create Database**
   Create a MySQL database named `uas_db` (or your preferred name):
   ```sql
   CREATE DATABASE uas_db;
   ```

5. **Run Migrations**
   ```bash
   php artisan migrate
   ```

6. **Seed Demo Data**
   ```bash
   php artisan db:seed --class=DemoDataSeeder
   ```

## Demo Accounts

After seeding, you can use these accounts:

- **Admin**: 
  - Email: `admin@uas.edu`
  - Password: `password`

- **Accountant**: 
  - Email: `accountant@uas.edu`
  - Password: `password`

- **Student**: 
  - Email: `student@uas.edu`
  - Password: `password`

## API Implementation

The backend includes a complete RESTful API with the following features:

### Controllers Implemented
- **AuthController** - User authentication (register, login, logout)
- **InvoiceController** - Invoice management (CRUD operations)
- **PaymentController** - Payment processing
- **PayrollController** - Payroll management and reporting
- **BudgetController** - Department budget management
- **StudentFeeController** - Student fee management
- **UserController** - User management
- **DepartmentController** - Department management
- **ReportController** - Financial and budget reports

### Features
- ✅ Role-based access control (Admin, Accountant, Student)
- ✅ Authentication using Laravel Sanctum
- ✅ Request validation
- ✅ Business logic for accounting operations
- ✅ Automatic invoice status updates based on payments
- ✅ Budget tracking and transaction management
- ✅ Payroll report generation
- ✅ CORS configuration for frontend integration

### API Documentation
See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API endpoint documentation.

### Base URL
```
http://localhost:8000/api
```

All protected routes require authentication. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

## Models and Relationships

All models are located in `app/Models/` with the following relationships:

- **User** → hasOne(Student), hasOne(Staff)
- **Student** → belongsTo(User), belongsTo(Department), hasMany(Invoice), hasMany(Payment)
- **Staff** → belongsTo(User), belongsTo(Department), hasMany(Payroll)
- **Department** → hasMany(Student), hasMany(Staff), hasMany(DepartmentBudget)
- **Invoice** → belongsTo(Student), hasMany(Payment)
- **Payment** → belongsTo(Invoice), belongsTo(Student)
- **DepartmentBudget** → belongsTo(Department), hasMany(BudgetCategory), hasMany(BudgetTransaction)
- **BudgetCategory** → belongsTo(DepartmentBudget), hasMany(BudgetTransaction)
- **BudgetTransaction** → belongsTo(DepartmentBudget), belongsTo(BudgetCategory)
- **Payroll** → belongsTo(Staff)

## License

MIT

