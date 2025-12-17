# Email Configuration Guide

This guide explains how to configure email sending for the newsletter subscription feature.

## Overview

The newsletter subscription feature sends a welcome email when a user subscribes to the newsletter. Laravel uses the Mail facade to send emails.

## Configuration Steps

### 1. Update `.env` File

Add the following mail configuration to your `.env` file in the `uas-backend` directory:

#### Option 1: Using SMTP (Recommended for Production)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

**For Gmail:**
- You need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
- Enable 2-Step Verification first
- Generate an App Password: Google Account → Security → 2-Step Verification → App Passwords

#### Option 2: Using Mailtrap (Recommended for Development/Testing)

Mailtrap is a fake SMTP server for testing emails without sending real emails.

1. **Sign up for Mailtrap**: https://mailtrap.io/ (free tier available)
2. **Get your credentials** from Mailtrap inbox settings
3. **Update `.env`**:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@uas.edu
MAIL_FROM_NAME="University Accounting System"
```

#### Option 3: Using Mailgun (Production)

```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.com
MAILGUN_SECRET=your-mailgun-secret
MAILGUN_ENDPOINT=api.mailgun.net
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"
```

### 2. Test Email Configuration

After configuring, test if emails are working:

```bash
cd uas-backend
php artisan tinker
```

Then in tinker:

```php
use Illuminate\Support\Facades\Mail;
use App\Mail\NewsletterSubscriptionMail;
use App\Models\User;

$user = User::first();
Mail::to($user->email)->send(new NewsletterSubscriptionMail($user));
```

### 3. Verify Email Sending

- **Mailtrap**: Check your Mailtrap inbox
- **SMTP**: Check the recipient's inbox (and spam folder)
- **Check Laravel logs**: `storage/logs/laravel.log` for any errors

## Troubleshooting

### Error: "Connection could not be established"

**Solution:**
- Check your `MAIL_HOST` and `MAIL_PORT` are correct
- Verify firewall allows outbound connections on the mail port
- For Gmail, ensure you're using an App Password, not your regular password

### Error: "Authentication failed"

**Solution:**
- Double-check `MAIL_USERNAME` and `MAIL_PASSWORD`
- For Gmail, make sure 2-Step Verification is enabled and you're using an App Password
- For Mailtrap, verify credentials in your Mailtrap dashboard

### Emails not appearing

**Solution:**
- Check spam/junk folder
- Verify `MAIL_FROM_ADDRESS` is a valid email
- Check Laravel logs: `tail -f storage/logs/laravel.log`
- For Mailtrap, check your inbox in the Mailtrap dashboard

### For Development (No Real Email Needed)

Use Mailtrap - it's perfect for development as it captures all emails without sending them to real addresses.

## Newsletter Subscription Flow

1. User checks "Subscribe to newsletter" in Profile page
2. User clicks "Save Changes"
3. Frontend sends `PATCH /api/users/{id}` with `newsletter_subscribed: true`
4. Backend updates user record
5. Backend detects subscription change (was false, now true)
6. Backend sends `NewsletterSubscriptionMail` to user's email
7. User receives welcome email

## Email Template

The email template is located at:
- **View**: `resources/views/emails/newsletter-subscription.blade.php`
- **Mail Class**: `app/Mail/NewsletterSubscriptionMail.php`

You can customize the email template by editing the Blade file.

---

**Last Updated:** December 2024

