# Server-Side Integration Guide

## Quick Start

### Prerequisites
- PHP 8.1+ with Composer
- MySQL 5.7+
- Node.js 18+ with npm
- Angular CLI

### Step 1: Laravel Backend Setup

```bash
cd uas-backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Update .env with your database credentials:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=uas_db
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Create database
mysql -u root -p -e "CREATE DATABASE uas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
php artisan migrate

# Seed demo data
php artisan db:seed --class=DemoDataSeeder

# Start Laravel server
php artisan serve
```

Laravel will run on `http://localhost:8000`

### Step 2: Angular Frontend Setup

```bash
cd uas-frontend

# Install dependencies
npm install

# Start Angular dev server
ng serve
```

Angular will run on `http://localhost:4200`

### Step 3: Verify Integration

1. **Open Browser**: Navigate to `http://localhost:4200`
2. **Test Login**:
   - Username: `admin` / Password: `password` (Admin)
   - Username: `accountant` / Password: `password` (Accountant)
   - Username: `student` / Password: `password` (Student)
3. **Verify Navigation**: Check that routes are protected based on role
4. **Test API Calls**: Open browser DevTools → Network tab, verify API calls are made

---

## Configuration Files

### Laravel Configuration

**`.env`** - Update these values:
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4200

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=uas_db
DB_USERNAME=root
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:4200,127.0.0.1
```

**`config/cors.php`** - Already configured for:
- `http://localhost:4200`
- `withCredentials: true`
- Cookie support

**`config/sanctum.php`** - Configured for SPA authentication

### Angular Configuration

**`src/environments/environment.ts`** - Already configured:
```typescript
apiUrl: 'http://localhost:8000/api'
```

---

## Authentication Flow

1. User logs in via Angular form
2. Angular sends POST to `/api/auth/login`
3. Laravel validates credentials
4. Laravel creates Sanctum token
5. Laravel sets HTTP-only cookie
6. Laravel returns user data + token
7. Angular stores token in localStorage (backup)
8. Angular stores user in UserService (in-memory)
9. Angular redirects to dashboard

**Subsequent Requests:**
- Angular HTTP interceptor adds `Authorization: Bearer {token}` header
- Browser automatically sends HTTP-only cookie
- Laravel validates token from cookie or header
- Laravel returns requested data

---

## Role-Based Access

### Student
- Can view: Own invoices, own payments, own profile
- Can create: Payment requests for own invoices
- Cannot access: User management, payroll, budgets (except own fees)

### Accounting
- Can view: All invoices, all payments, budgets, reports
- Can create: Invoices, payments, budgets, payrolls
- Cannot access: User management (except own profile)

### Admin
- Full access to everything
- Can manage: Users, departments, all financial data

---

## Troubleshooting

### CORS Errors
- Ensure `config/cors.php` has correct origins
- Check that `withCredentials: true` is set in Angular HTTP calls
- Verify `SANCTUM_STATEFUL_DOMAINS` in `.env`

### Authentication Not Working
- Check browser DevTools → Application → Cookies (should see `auth_token`)
- Verify token in localStorage (backup)
- Check Laravel logs: `storage/logs/laravel.log`
- Verify Sanctum middleware is applied to routes

### 401 Unauthorized
- Token expired or invalid
- Cookie not being sent (check CORS settings)
- Token not in Authorization header

### 403 Forbidden
- User doesn't have required role
- Check RoleMiddleware is working
- Verify user role in database

### API Calls Not Working
- Verify Laravel server is running on port 8000
- Check Angular `environment.ts` has correct `apiUrl`
- Verify HTTP interceptor is registered in `app.config.ts`
- Check browser console for errors

---

## Testing Checklist

- [ ] Laravel server starts without errors
- [ ] Angular server starts without errors
- [ ] Can register new user
- [ ] Can login with existing user
- [ ] Cookie is set after login (check DevTools)
- [ ] Token is in localStorage after login
- [ ] Can access protected routes when logged in
- [ ] Cannot access protected routes when logged out
- [ ] Role-based navigation works (sidebar items)
- [ ] Student can only see own data
- [ ] Accounting can see all invoices/payments
- [ ] Admin can access user management
- [ ] API calls return data (check Network tab)
- [ ] Logout clears cookie and redirects to login

---

## Next Steps

1. **Update Components**: Replace mock data with API calls in:
   - Dashboard component
   - Invoice components
   - Payment components
   - Budget components
   - Profile component

2. **Add Error Handling**: Implement proper error messages in UI

3. **Add Loading States**: Show loading indicators during API calls

4. **Add Pagination**: Implement pagination UI for list endpoints

5. **Production Deployment**: 
   - Enable HTTPS
   - Set `Secure` flag on cookies
   - Update CORS for production domain
   - Configure production database

---

## Support

For issues, check:
- Laravel logs: `storage/logs/laravel.log`
- Browser console for JavaScript errors
- Network tab for API request/response details
- `DATA_STORAGE.md` for storage strategy details

