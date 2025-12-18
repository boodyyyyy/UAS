# Brevo Email Setup Guide

## Overview

The newsletter subscription feature uses Brevo (formerly Sendinblue) to send welcome emails when users subscribe.

## Setup Steps

### 1. Get Your Brevo API Key

**Important:** Use an **API Key**, NOT SMTP credentials. We're using Brevo's HTTP API, not SMTP.

1. Go to https://www.brevo.com/ and sign up (free tier available)
2. Log in to your account
3. Go to **Settings** → **SMTP & API** → **API Keys**
4. Click **Generate a new API key**
5. Give it a name (e.g., "UAS Newsletter")
6. Copy the API key (it starts with `xkeysib-...` or similar)
7. **Save it immediately** - you won't be able to see it again!

**Note:** 
- ✅ Use **API Key** (for HTTP API calls)
- ❌ Do NOT use SMTP credentials (username/password)

### 2. Update Your `.env` File

Open `UAS/uas-backend/.env` and add:

```env
BREVO_API_KEY=your_brevo_api_key_here
MAIL_FROM_ADDRESS=noreply@uas.edu
MAIL_FROM_NAME="University Accounting System"
```

**Important Notes:**
- Replace `your_brevo_api_key_here` with your actual Brevo API key
- The `MAIL_FROM_ADDRESS` must be a verified sender email in Brevo
- For testing, you can use the email you registered with Brevo

### 3. Verify Your Sender Email in Brevo

1. Go to Brevo Dashboard → **Senders** → **Add a sender**
2. Add and verify your email address
3. Use this verified email as `MAIL_FROM_ADDRESS` in `.env`

### 4. Clear Config Cache

After updating `.env`, run:

```bash
cd UAS/uas-backend
php artisan config:clear
```

### 5. Restart Laravel Server

Stop your current server (Ctrl+C) and restart:

```bash
php artisan serve
```

### 6. Test It!

1. Subscribe to the newsletter in your profile
2. Check your email inbox (and spam folder)
3. Check Brevo dashboard → **Statistics** → **Emails** to see sent emails

## Testing with Tinker

You can test email sending directly:

```bash
cd UAS/uas-backend
php artisan tinker
```

Then paste:

```php
use App\Services\BrevoEmailService;
use App\Models\User;

$user = User::first();
$emailService = new BrevoEmailService();
$result = $emailService->sendNewsletterWelcome($user);
echo $result ? "Email sent!" : "Email failed - check logs";
```

## Troubleshooting

### Email Not Received

1. **Check Laravel logs:**
   ```bash
   tail -n 50 storage/logs/laravel.log | grep -i "brevo\|newsletter"
   ```

2. **Check Brevo dashboard:**
   - Go to Brevo → **Statistics** → **Emails**
   - See if email appears there

3. **Verify API key:**
   - Make sure `BREVO_API_KEY` is correct in `.env`
   - No quotes around the API key

4. **Check sender verification:**
   - The `MAIL_FROM_ADDRESS` must be verified in Brevo
   - Go to Brevo → **Senders** to verify

### Common Errors

- **"Brevo API key is not configured"** → Add `BREVO_API_KEY` to `.env`
- **"401 Unauthorized"** → API key is invalid
- **"422 Unprocessable Entity"** → Sender email not verified in Brevo

## Brevo Features

- ✅ Free tier: 300 emails/day
- ✅ Easy API integration
- ✅ Reliable delivery
- ✅ Email analytics
- ✅ No class redeclaration issues (uses HTTP API)

---

For more information, visit: https://developers.brevo.com/

