@echo off
echo Setting up Laravel Backend for UAS...
echo.

echo Step 1: Installing Composer dependencies...
call composer install
if errorlevel 1 (
    echo ERROR: Composer install failed. Make sure Composer is installed.
    pause
    exit /b 1
)

echo.
echo Step 2: Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env file created. Please update database credentials.
) else (
    echo .env file already exists.
)

echo.
echo Step 3: Generating application key...
call php artisan key:generate
if errorlevel 1 (
    echo WARNING: Could not generate key. Make sure PHP is installed and in PATH.
)

echo.
echo Step 4: Please create the database 'uas_db' in MySQL before continuing.
echo Press any key when database is ready...
pause >nul

echo.
echo Step 5: Running migrations...
call php artisan migrate
if errorlevel 1 (
    echo ERROR: Migration failed. Check database credentials in .env file.
    pause
    exit /b 1
)

echo.
echo Step 6: Seeding demo data...
call php artisan db:seed --class=DemoDataSeeder
if errorlevel 1 (
    echo ERROR: Seeding failed.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup completed successfully!
echo.
echo Demo Accounts:
echo - Admin: admin@uas.edu / password
echo - Accountant: accountant@uas.edu / password
echo - Student: student@uas.edu / password
echo ========================================
pause

