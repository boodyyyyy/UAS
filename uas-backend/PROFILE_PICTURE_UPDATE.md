# Profile Picture Storage Update

## What Changed

The profile picture storage has been updated to support larger files and base64-encoded images.

### Changes Made

1. **Database Migration:**
   - Changed `picture` column from `VARCHAR(255)` to `TEXT`
   - This allows storing much larger base64-encoded images (up to ~65KB for TEXT, or can be changed to LONGTEXT for even larger)

2. **Validation Rules Updated:**
   - `UpdateUserRequest`: Changed from `max:255` to `max:10485760` (~10MB)
   - `StoreUserRequest`: Changed from `max:255` to `max:10485760` (~10MB)
   - This allows base64-encoded images up to ~10MB

### Why This Was Needed

- Profile pictures are stored as base64-encoded strings in the database
- Base64 encoding increases file size by ~33%
- A 5MB image becomes ~6.7MB when base64-encoded
- The previous 255 character limit was too small for any practical image

### Migration Steps

Run the migration to update your database:

```bash
cd UAS/uas-backend
php artisan migrate
```

### Technical Details

- **TEXT column**: Can store up to 65,535 characters (~65KB)
- **Base64 encoding**: Increases size by ~33%
- **Validation limit**: 10MB (10,485,760 characters) - allows for large images
- **Frontend limit**: 5MB file size (before base64 encoding)

### If You Need Even Larger Images

If you need to support images larger than ~65KB, you can change the migration to use `LONGTEXT` instead:

```php
$table->longText('picture')->nullable()->change();
```

LONGTEXT can store up to 4GB of data.

---

**Note:** After running the migration, existing profile pictures will continue to work, and new larger images can now be uploaded.

