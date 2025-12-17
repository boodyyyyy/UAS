# How to Clear All Users from Database

This guide shows you different ways to clear all users from the database to start fresh.

## ⚠️ Important Warning

**Users have foreign key relationships with:**
- `students` table (via `user_id`)
- `staff` table (via `user_id`)
- `invoices` (via students)
- `payments` (via students)
- `payrolls` (via staff)

**Clearing users will also require clearing related data or handling foreign key constraints.**

---

## Method 1: Using Laravel Tinker (Recommended - Safest)

This method allows you to clear users while handling relationships properly.

### Steps:

1. **Open Laravel Tinker:**
   ```bash
   cd uas-backend
   php artisan tinker
   ```

2. **In Tinker, run these commands:**
   ```php
   // Delete related data first (to avoid foreign key errors)
   \App\Models\Payroll::truncate();
   \App\Models\Payment::truncate();
   \App\Models\Invoice::truncate();
   \App\Models\BudgetTransaction::truncate();
   \App\Models\BudgetCategory::truncate();
   \App\Models\DepartmentBudget::truncate();
   \App\Models\Staff::truncate();
   \App\Models\Student::truncate();
   
   // Now delete all users
   \App\Models\User::truncate();
   
   // Clear personal access tokens
   \DB::table('personal_access_tokens')->truncate();
   ```

3. **Exit Tinker:**
   ```php
   exit
   ```

4. **Reseed demo data (optional):**
   ```bash
   php artisan db:seed --class=DemoDataSeeder
   ```

---

## Method 2: Fresh Migration (Clears Everything)

This will **delete ALL tables** and recreate them, then you can reseed.

### Steps:

```bash
cd uas-backend

# This will drop all tables and re-run migrations
php artisan migrate:fresh

# Reseed demo data
php artisan db:seed --class=DemoDataSeeder
```

**⚠️ Warning:** This deletes **ALL** data (users, invoices, payments, budgets, etc.)

---

## Method 3: Using SQL Directly

If you have direct database access:

### MySQL Command Line:

```bash
mysql -u root -p uas_db
```

Then run:

```sql
-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Delete related data
TRUNCATE TABLE payrolls;
TRUNCATE TABLE payments;
TRUNCATE TABLE invoices;
TRUNCATE TABLE budget_transactions;
TRUNCATE TABLE budget_categories;
TRUNCATE TABLE department_budgets;
TRUNCATE TABLE staff;
TRUNCATE TABLE students;
TRUNCATE TABLE users;
TRUNCATE TABLE personal_access_tokens;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
```

### Using phpMyAdmin or MySQL Workbench:

1. Select your database `uas_db`
2. Run the SQL commands above

---

## Method 4: Delete Only Users (Keep Other Data)

If you want to keep invoices, payments, etc., but just remove users:

### Using Tinker:

```bash
cd uas-backend
php artisan tinker
```

```php
// Delete staff and students first (they reference users)
\App\Models\Staff::query()->delete();
\App\Models\Student::query()->delete();

// Delete all users
\App\Models\User::query()->delete();

// Clear tokens
\DB::table('personal_access_tokens')->truncate();
```

**Note:** This will leave orphaned invoices/payments that reference deleted students.

---

## Method 5: Create a Custom Artisan Command (Most Professional)

Create a command to safely clear users:

### Create the command:

```bash
cd uas-backend
php artisan make:command ClearUsers
```

### Edit `app/Console/Commands/ClearUsers.php`:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Student;
use App\Models\Staff;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Payroll;
use Illuminate\Support\Facades\DB;

class ClearUsers extends Command
{
    protected $signature = 'users:clear {--keep-data : Keep invoices, payments, etc.}';
    protected $description = 'Clear all users from the database';

    public function handle()
    {
        if (!$this->confirm('Are you sure you want to delete all users?')) {
            $this->info('Operation cancelled.');
            return;
        }

        if ($this->option('keep-data')) {
            // Only delete users, students, and staff
            Staff::query()->delete();
            Student::query()->delete();
            User::query()->delete();
            DB::table('personal_access_tokens')->truncate();
            $this->info('Users cleared (related data kept).');
        } else {
            // Delete everything
            Payroll::query()->delete();
            Payment::query()->delete();
            Invoice::query()->delete();
            Staff::query()->delete();
            Student::query()->delete();
            User::query()->delete();
            DB::table('personal_access_tokens')->truncate();
            $this->info('All users and related data cleared.');
        }

        $this->info('Done!');
    }
}
```

### Usage:

```bash
# Clear users only (keep invoices, payments, etc.)
php artisan users:clear --keep-data

# Clear users and all related data
php artisan users:clear
```

---

## Quick Reset Script (Recommended for Development)

Create a batch file for Windows:

### `UAS/uas-backend/reset-users.bat`:

```batch
@echo off
echo Clearing all users and related data...
echo.

cd /d "%~dp0"

php artisan tinker --execute="
\App\Models\Payroll::truncate();
\App\Models\Payment::truncate();
\App\Models\Invoice::truncate();
\App\Models\BudgetTransaction::truncate();
\App\Models\BudgetCategory::truncate();
\App\Models\DepartmentBudget::truncate();
\App\Models\Staff::truncate();
\App\Models\Student::truncate();
\App\Models\User::truncate();
\DB::table('personal_access_tokens')->truncate();
echo 'All users cleared!';
"

echo.
echo Reseeding demo data...
php artisan db:seed --class=DemoDataSeeder

echo.
echo Done! Users have been reset.
pause
```

### Usage:

```bash
cd uas-backend
reset-users.bat
```

---

## After Clearing Users

### 1. Reseed Demo Data:

```bash
cd uas-backend
php artisan db:seed --class=DemoDataSeeder
```

This will create:
- Admin: `admin@uas.edu` / `password`
- Accountant: `accountant@uas.edu` / `password`
- Student: `student@uas.edu` / `password`
- Staff: `staff1@uas.edu` / `password`

### 2. Verify Users:

```bash
php artisan tinker
```

```php
\App\Models\User::all(['id', 'username', 'email', 'role']);
```

---

## Recommended Approach for Development

**For quick development resets, use Method 2 (Fresh Migration):**

```bash
cd uas-backend
php artisan migrate:fresh --seed
```

This is the cleanest way to start fresh with all demo data.

---

## Troubleshooting

### Error: "Cannot delete or update a parent row: a foreign key constraint fails"

**Solution:** Delete child records first (students, staff) before deleting users, or use `truncate()` which ignores foreign keys.

### Error: "Table doesn't exist"

**Solution:** Run migrations first:
```bash
php artisan migrate
```

### Error: "Access denied"

**Solution:** Check your database credentials in `.env` file.

---

**Last Updated:** December 2024

