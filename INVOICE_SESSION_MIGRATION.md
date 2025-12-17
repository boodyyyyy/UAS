# Invoice Storage Migration: localStorage → Server-Side Database

## Summary

The invoice storage has been migrated from **client-side localStorage** to **server-side database**. Invoices are now stored in MySQL database on the server instead of browser localStorage.

---

## What Changed

### Backend Changes

1. **Existing Controller:** `UAS/uas-backend/app/Http/Controllers/InvoiceController.php`
   - Already handles all database-based invoice operations
   - Stores invoices in MySQL database using Eloquent models
   - No changes needed - uses existing production-ready system

2. **Existing API Routes:** Already in `UAS/uas-backend/routes/api.php`
   ```
   GET    /api/invoices        - Get all invoices from database
   GET    /api/invoices/{id}   - Get single invoice
   POST   /api/invoices        - Create invoice in database
   PUT    /api/invoices/{id}   - Update invoice in database
   PATCH  /api/invoices/{id}   - Update invoice in database
   DELETE /api/invoices/{id}   - Delete invoice from database
   ```

### Frontend Changes

1. **API Service:** `UAS/uas-frontend/src/app/services/api.service.ts`
   - Uses existing database API methods (no changes needed)
   - Removed session invoice methods (not needed)

2. **Data Service:** `UAS/uas-frontend/src/app/services/data.service.ts`
   - `getInvoices()` - Now fetches from server database instead of localStorage
   - `createInvoice()` - Now stores in server database instead of localStorage
   - `updateInvoiceStatus()` - Now updates server database instead of localStorage
   - **Removed:** All localStorage invoice storage code
   - **Removed:** Sample data initialization for invoices

---

## How It Works

### Storage Flow

```
1. Frontend calls dataService.getInvoices()
   ↓
2. dataService calls apiService.getInvoices()
   ↓
3. HTTP GET request to /api/invoices
   (withCredentials: true - sends auth cookie)
   ↓
4. Backend InvoiceController queries MySQL database
   Invoice::with(['student.user', 'payments'])->paginate()
   ↓
5. Backend returns invoices with pagination
   ↓
6. Frontend receives and displays invoices
```

### Database Storage Location

**Invoices are stored in:**
- **MySQL Database:** `invoices` table
- **Permanent storage:** Data persists across sessions
- **Relationships:** Linked to students, payments, etc.

---

## Configuration

### Laravel Session Configuration

Sessions are enabled by default in Laravel. To configure:

**File:** `.env` (in `uas-backend` directory)

```env
SESSION_DRIVER=file          # Options: file, database, redis, memcached
SESSION_LIFETIME=120        # Minutes (default: 120)
SESSION_ENCRYPT=false       # Encrypt session data
SESSION_PATH=/              # Cookie path
SESSION_DOMAIN=null         # Cookie domain
```

### Session Directory

Ensure the sessions directory exists:

```bash
cd uas-backend
mkdir -p storage/framework/sessions
chmod -R 775 storage/framework/sessions
```

**Windows:**
```cmd
cd uas-backend
mkdir storage\framework\sessions
```

---

## API Endpoints

### Get Invoices from Database
```http
GET /api/invoices?page=1&per_page=15&status=pending
Authorization: Bearer {token}
Cookie: {auth_cookie}

Response:
{
  "data": [
    {
      "id": 1,
      "invoiceId": "INV-2024-001",
      "studentId": 3,
      "studentName": "Alex Johnson",
      "description": "Fall 2024 Tuition",
      "amount": 12500,
      "issueDate": "2024-07-15",
      "dueDate": "2024-08-15",
      "status": "pending",
      "createdAt": "2024-07-15T00:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  },
  "message": "Invoices retrieved successfully"
}
```

### Create Invoice
```http
POST /api/invoices
Authorization: Bearer {token}
Cookie: {auth_cookie}
Content-Type: application/json

Body:
{
  "student_id": 3,
  "description": "Fall 2024 Tuition",
  "amount": 12500,
  "issue_date": "2024-07-15",
  "due_date": "2024-08-15",
  "status": "pending"
}

Response:
{
  "data": { /* invoice object */ },
  "message": "Invoice created successfully"
}
```

### Update Invoice
```http
PATCH /api/invoices/{id}
Authorization: Bearer {token}
Cookie: {auth_cookie}
Content-Type: application/json

Body:
{
  "status": "paid"
}

Response:
{
  "data": { /* updated invoice */ },
  "message": "Invoice updated successfully"
}
```

### Delete Invoice
```http
DELETE /api/invoices/{id}
Authorization: Bearer {token}
Cookie: {auth_cookie}
```

---

## Frontend Usage

### Before (localStorage):
```typescript
// Old way - stored in browser localStorage
const invoices = this.storage.getLocalStorage<Invoice[]>('uas_invoices') || [];
this.storage.setLocalStorage('uas_invoices', invoices);
```

### After (Server Database):
```typescript
// New way - stored in server database
this.dataService.getInvoices().subscribe(invoices => {
  // invoices come from server database
});

this.dataService.createInvoice(newInvoice).subscribe(invoice => {
  // invoice stored in server database (permanent)
});
```

---

## Benefits

1. **Server-Side Storage:** Data stored in database, not in browser
2. **Permanent Storage:** Data persists across sessions and browser restarts
3. **Security:** Sensitive data not exposed in browser storage
4. **Centralized:** All users' invoice data managed in database
5. **Data Integrity:** Database constraints and relationships ensure data consistency
6. **Scalability:** Database can handle large amounts of data efficiently
7. **Backup & Recovery:** Database backups protect against data loss
8. **Multi-User:** Multiple users can access invoices simultaneously

---

## Error Handling

The frontend properly handles errors from the database API:

```typescript
catchError(error => {
  console.error('Failed to get invoices from server', error);
  return throwError(() => error);
})
```

Errors are propagated to the calling component, which can:
- Display error messages to the user
- Retry the operation
- Show appropriate UI feedback

---

## Testing

### Test Session Storage:

1. **Login to the application**
2. **Create or view invoices**
3. **Check browser DevTools:**
   - Application → Cookies → Should see session cookie
   - Network → Check requests to `/api/session/invoices`
4. **Check server:**
   - `storage/framework/sessions/` directory should contain session files
   - Session files contain serialized invoice data

### Verify Session is Working:

```bash
# Check if session files are being created
ls -la storage/framework/sessions/

# Check session content (if using file driver)
cat storage/framework/sessions/[session_id]
```

---

## Migration Notes

- **Old localStorage data:** Still exists but is no longer used for invoices
- **No backward compatibility:** Frontend now exclusively uses database API
- **No data migration needed:** New invoices go to database, old localStorage data remains unused
- **Permanent storage:** Invoices in database persist indefinitely (until deleted)
- **Database required:** Backend must have MySQL database running and migrations executed

---

## Troubleshooting

### Issue: Database connection errors

**Solution:**
1. Check MySQL database is running
2. Verify database credentials in `.env` file
3. Run migrations: `php artisan migrate`
4. Check database connection: `php artisan tinker` then `DB::connection()->getPdo()`

### Issue: CORS errors

**Solution:**
1. Ensure `withCredentials: true` is set in frontend requests
2. Check `config/cors.php` has `'supports_credentials' => true`
3. Verify `SANCTUM_STATEFUL_DOMAINS` includes frontend URL

### Issue: Invoices not appearing

**Solution:**
1. Check database has invoice records: `SELECT * FROM invoices;`
2. Verify user has proper role/permissions
3. Check API response in browser DevTools Network tab
4. Verify InvoiceController is returning data correctly

---

**Last Updated:** December 2024  
**Status:** ✅ Migrated from localStorage to server-side database (MySQL)

