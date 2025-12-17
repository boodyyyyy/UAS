# Setup Instructions for UAS Laravel Backend

## Prerequisites

Before setting up the backend, ensure you have the following installed:

1. **PHP 8.1 or higher** - [Download PHP](https://www.php.net/downloads.php)
2. **Composer** - [Download Composer](https://getcomposer.org/download/)
3. **MySQL 5.7+ or MariaDB** - [Download MySQL](https://dev.mysql.com/downloads/)
4. **Node.js and NPM** (optional, for frontend)

## Quick Setup

### Windows Users

1. Open Command Prompt or PowerShell in the `uas-backend` directory
2. Run: `setup.bat`
3. Follow the on-screen instructions

### Linux/Mac Users

1. Open Terminal in the `uas-backend` directory
2. Make the script executable: `chmod +x setup.sh`
3. Run: `./setup.sh`
4. Follow the on-screen instructions

## Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies

```bash
composer install
```

### 2. Configure Environment

Copy `.env.example` to `.env` (if it doesn't exist):
```bash
copy .env.example .env  # Windows
# or
cp .env.example .env    # Linux/Mac
```

Edit `.env` and update your database credentials:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=uas_db
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Create Database

Create a MySQL database:
```sql
CREATE DATABASE uas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use MySQL command line:
```bash
mysql -u root -p -e "CREATE DATABASE uas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 5. Run Migrations

```bash
php artisan migrate
```

This will create all the necessary tables:
- users
- departments
- students
- staff
- invoices
- payments
- department_budgets
- budget_categories
- budget_transactions
- payrolls

### 6. Seed Demo Data

```bash
php artisan db:seed --class=DemoDataSeeder
```

Or seed all seeders:
```bash
php artisan db:seed
```

## Demo Accounts

After seeding, you can use these accounts to test the system:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@uas.edu | password |
| Accountant | accountant@uas.edu | password |
| Student | student@uas.edu | password |

## Database Structure

### Tables Created

1. **users** - User accounts with authentication
2. **departments** - University departments
3. **students** - Student profiles linked to users
4. **staff** - Staff/employee profiles linked to users
5. **invoices** - Student invoices for fees
6. **payments** - Payment transactions
7. **department_budgets** - Department budget allocations
8. **budget_categories** - Budget categories within departments
9. **budget_transactions** - Budget transaction history
10. **payrolls** - Staff payroll records

### Relationships

- Users can be Students or Staff
- Students belong to Departments
- Staff belong to Departments
- Invoices belong to Students
- Payments belong to Invoices and Students
- Department Budgets belong to Departments
- Budget Categories belong to Department Budgets
- Budget Transactions belong to Department Budgets and Categories
- Payrolls belong to Staff

## Troubleshooting

### Composer not found
- Install Composer from https://getcomposer.org/
- Make sure Composer is in your system PATH

### PHP not found
- Install PHP 8.1+ from https://www.php.net/
- Add PHP to your system PATH
- Restart your terminal/command prompt

### Database connection error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database `uas_db` exists
- Check MySQL user permissions

### Migration errors
- Ensure all previous migrations ran successfully
- Check database connection
- Verify table names don't conflict with existing tables

## Next Steps

After setup:
1. The backend is ready for API development
2. Create API controllers in `app/Http/Controllers`
3. Define API routes in `routes/api.php`
4. Connect your Angular frontend to the Laravel API

## Support

For issues or questions, refer to:
- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Migration Guide](https://laravel.com/docs/migrations)

