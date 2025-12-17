# Quick Email Setup Guide

## The Problem
You're not receiving emails because Laravel's mail configuration isn't set up yet.

## Quick Solution: Use Mailtrap (Recommended for Testing)

Mailtrap is a fake SMTP server that captures emails without sending them to real addresses. Perfect for development!

### Step 1: Sign up for Mailtrap (Free)
1. Go to https://mailtrap.io/
2. Sign up for a free account
3. Create a new inbox

### Step 2: Get Your Credentials
1. In Mailtrap, go to your inbox
2. Click "SMTP Settings"
3. Select "PHP" tab
4. Copy the credentials:
   - Host: `smtp.mailtrap.io`
   - Port: `2525`
   - Username: (your username)
   - Password: (your password)

### Step 3: Update Your `.env` File

Open `UAS/uas-backend/.env` and add/update these lines:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username-here
MAIL_PASSWORD=your-mailtrap-password-here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@uas.edu
MAIL_FROM_NAME="University Accounting System"
```

### Step 4: Clear Config Cache
Run this command (use `config:clear`, NOT `cache:clear`):
```bash
cd UAS/uas-backend
php artisan config:clear
```

**Note:** If you get an error about cache table, make sure your `.env` has:
```env
CACHE_DRIVER=file
```
Then run `php artisan config:clear` again.

### Step 5: Test It!
1. Subscribe to the newsletter in your profile
2. Check your Mailtrap inbox - you should see the welcome email there!

---

## Alternative: Use Gmail (For Real Emails)

If you want to send real emails:

1. **Enable 2-Step Verification** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Generate a password for "Mail"
3. **Update `.env`**:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password-here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="University Accounting System"
```

4. **Clear config cache**: `php artisan config:clear`

---

## Troubleshooting

If emails still don't work:
1. Check `storage/logs/laravel.log` for errors
2. Make sure `.env` file exists and has correct values
3. Run `php artisan config:clear` after changing `.env`
4. Restart your Laravel server (`php artisan serve`)

---

**Note:** The error "Please provide a valid cache path" means Laravel can't find the cache directory. Make sure `bootstrap/cache` directory exists and is writable.

