#!/bin/bash

echo "Setting up Laravel Backend for UAS..."
echo ""

echo "Step 1: Installing Composer dependencies..."
composer install
if [ $? -ne 0 ]; then
    echo "ERROR: Composer install failed. Make sure Composer is installed."
    exit 1
fi

echo ""
echo "Step 2: Creating .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo ".env file created. Please update database credentials."
else
    echo ".env file already exists."
fi

echo ""
echo "Step 3: Generating application key..."
php artisan key:generate
if [ $? -ne 0 ]; then
    echo "WARNING: Could not generate key. Make sure PHP is installed."
fi

echo ""
echo "Step 4: Please create the database 'uas_db' in MySQL before continuing."
read -p "Press Enter when database is ready..."

echo ""
echo "Step 5: Running migrations..."
php artisan migrate
if [ $? -ne 0 ]; then
    echo "ERROR: Migration failed. Check database credentials in .env file."
    exit 1
fi

echo ""
echo "Step 6: Seeding demo data..."
php artisan db:seed --class=DemoDataSeeder
if [ $? -ne 0 ]; then
    echo "ERROR: Seeding failed."
    exit 1
fi

echo ""
echo "========================================"
echo "Setup completed successfully!"
echo ""
echo "Demo Accounts:"
echo "- Admin: admin@uas.edu / password"
echo "- Accountant: accountant@uas.edu / password"
echo "- Student: student@uas.edu / password"
echo "========================================"

