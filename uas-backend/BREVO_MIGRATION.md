# Migration from Resend to Brevo

## What Changed

The email system has been migrated from Resend to Brevo (formerly Sendinblue).

### Files Changed

1. **New Service Created:**
   - `app/Services/BrevoEmailService.php` - Handles all Brevo email operations via HTTP API

2. **Controller Updated:**
   - `app/Http/Controllers/UserController.php` - Now uses `BrevoEmailService` instead of `ResendEmailService`

3. **Old Files Removed:**
   - `app/Services/ResendEmailService.php` - No longer needed
   - All Resend-related troubleshooting markdown files

4. **Documentation:**
   - `BREVO_EMAIL_SETUP.md` - New setup guide for Brevo

### Configuration Required

Update your `.env` file:

**Remove:**
```env
RESEND_API_KEY=...
```

**Add:**
```env
BREVO_API_KEY=your_brevo_api_key_here
MAIL_FROM_ADDRESS=noreply@uas.edu
MAIL_FROM_NAME="University Accounting System"
```

### Optional: Remove Resend Package

If you want to remove the Resend package from Composer:

```bash
cd UAS/uas-backend
composer remove resend/resend-php
```

### Next Steps

1. Get your Brevo API key from https://www.brevo.com/
2. Add `BREVO_API_KEY` to your `.env` file
3. Verify your sender email in Brevo dashboard
4. Run `php artisan config:clear`
5. Restart Laravel server
6. Test newsletter subscription

See `BREVO_EMAIL_SETUP.md` for detailed instructions.

## Benefits of Brevo

- ✅ Free tier: 300 emails/day
- ✅ Reliable HTTP API (no class redeclaration issues)
- ✅ Easy integration
- ✅ Email analytics
- ✅ Better for development

