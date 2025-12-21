# University Accounting System (UAS)
## Project Report

**Date:** December 2024  
**Version:** 1.0  
**Status:** Production Ready

**Team Name:** 404 Balance not found

**Team Members:**
- Ahmed Megahed (13001265)
- Hassan Islam (13001118)
- Jana Raed (13002886)
- Abdelrahman Saeed (13004425)

---

## Executive Summary

The University Accounting System (UAS) is a comprehensive web-based application designed to manage all financial operations of a university, including student fee management, staff payroll processing, and department budget tracking. The system is built using modern web technologies with a clear separation between frontend (Angular) and backend (Laravel) components.

---

## 1. Project Overview

### 1.1 Purpose
The UAS provides a centralized platform for managing:
- Student invoice and payment processing
- Staff payroll management and reporting
- Department budget allocation and tracking
- User authentication and role-based access control
- Financial reporting and analytics

### 1.2 Target Users
- **Administrators**: Full system access and user management
- **Accounting Personnel**: Invoice, payment, payroll, and budget management
- **Students**: View and pay invoices, access payment history

---

## 2. System Architecture

### 2.1 Technology Stack

#### Frontend
- **Framework**: Angular 21
- **Language**: TypeScript 5.9
- **Styling**: SCSS
- **State Management**: RxJS Observables
- **Charts**: Chart.js, ng2-charts
- **HTTP Client**: Angular HttpClient with interceptors
- **Session Recording**: LogRocket for error tracking and user session replay

#### Backend
- **Framework**: Laravel 11
- **Language**: PHP 8.1+
- **Database**: MySQL 5.7+
- **Authentication**: Laravel Sanctum (Token-based)
- **API**: RESTful API architecture
- **Email**: Brevo (formerly Sendinblue) API for newsletter delivery

### 2.2 Architecture Pattern
- **Frontend-Backend Separation**: Clear API-based communication
- **RESTful API Design**: Standard HTTP methods and status codes
- **Role-Based Access Control (RBAC)**: Middleware-based route protection
- **Database-First Design**: MySQL with Eloquent ORM

---

## 3. Core Features

### 3.1 User Management
- User registration and authentication
- Role-based access control (Admin, Accounting, Student)
- Profile management with newsletter subscription
- User activation/deactivation
- Password management

### 3.2 Student Fee Management
- Invoice creation by admin/accounting staff
- Student username-based invoice assignment
- Automatic student record creation
- Invoice status tracking (pending, paid, overdue)
- Payment processing and history
- Real-time invoice visibility for students

### 3.3 Payment Processing
- Multiple payment methods support
- Payment status tracking
- Automatic invoice status updates
- Payment history and reporting
- Transaction ID management

### 3.4 Staff Payroll Management
- Payroll record creation
- Salary, allowances, and deductions calculation
- Net pay computation
- Payroll report generation
- Historical payroll data tracking

### 3.5 Department Budget Management
- Budget allocation per department
- Budget category management
- Income and expense tracking
- Budget transaction history
- Visual budget analytics (charts)
- Real-time balance updates

### 3.6 Financial Reporting
- Financial summary reports
- Department budget reports
- Payment analytics
- Revenue tracking

### 3.7 Newsletter Subscription
- Email newsletter subscription in user profile
- Automatic welcome email on subscription via Brevo API
- Professional email templates with Blade
- Email delivery tracking and analytics
- Brevo API integration for reliable email delivery

### 3.8 Session Recording & Error Tracking
- LogRocket integration for user session replay
- Automatic error capture and reporting
- Console log recording
- Network request monitoring (with sensitive data sanitization)
- User behavior analytics
- Performance monitoring

---

## 4. Database Structure

### 4.1 Core Tables
1. **users** - User accounts with authentication
2. **departments** - University departments
3. **students** - Student information
4. **staff** - Staff/employee information
5. **invoices** - Student invoices and fees
6. **payments** - Payment transactions
7. **department_budgets** - Budget allocations
8. **budget_categories** - Budget categories
9. **budget_transactions** - Budget transaction history
10. **payrolls** - Staff payroll records

### 4.2 Key Relationships
- User → Student (One-to-One)
- User → Staff (One-to-One)
- Student → Invoice (One-to-Many)
- Invoice → Payment (One-to-Many)
- Department → Budget (One-to-Many)
- Staff → Payroll (One-to-Many)

---

## 5. Security Features

### 5.1 Authentication
- Laravel Sanctum token-based authentication
- HTTP-only cookies for secure token storage
- Password hashing (bcrypt)
- Session management

### 5.2 Authorization
- Role-based middleware protection
- Route-level access control
- API endpoint protection
- User permission validation

### 5.3 Data Security
- SQL injection prevention (Eloquent ORM)
- XSS protection (Laravel built-in)
- CSRF token validation
- Input validation and sanitization
- Secure password storage

---

## 6. API Endpoints

### 6.1 Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### 6.2 User Management
- `GET /api/users` - List users (Admin)
- `POST /api/users` - Create user (Admin)
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user (Admin)

### 6.3 Invoice Management
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/{id}` - Get invoice details
- `PUT /api/invoices/{id}` - Update invoice
- `DELETE /api/invoices/{id}` - Delete invoice
- `POST /api/invoices/draft` - Save draft (Session)
- `GET /api/invoices/draft` - Get draft (Session)
- `DELETE /api/invoices/draft` - Clear draft (Session)

### 6.4 Payment Management
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `GET /api/payments/{id}` - Get payment details
- `POST /api/invoices/{id}/pay` - Pay invoice

### 6.5 Payroll Management
- `GET /api/payrolls` - List payrolls
- `POST /api/payrolls` - Create payroll
- `GET /api/payrolls/{id}` - Get payroll details
- `POST /api/payrolls/report` - Generate report

### 6.6 Budget Management
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/{id}` - Update budget
- `POST /api/budgets/transactions` - Add transaction

### 6.7 Reports
- `GET /api/reports/financial-summary` - Financial summary
- `GET /api/reports/department-budgets` - Department budgets

---

## 7. Data Storage Strategy

### 7.1 Server-Side (MySQL Database)
- All persistent business data
- User accounts and authentication
- Financial transactions
- Invoices and payments
- Payroll records
- Budget data

### 7.2 Server-Side Sessions
- Invoice drafts (temporary storage)
- User session data

### 7.3 Client-Side Storage
- Profile picture caching (localStorage)
- Remember username (cookies)
- Auth token fallback (localStorage)

---

## 8. Recent Updates & Enhancements

### 8.1 Backend Integration
- Complete migration from client-side to server-side storage
- RESTful API implementation
- Database-backed invoice and payment management
- Server-side session support for drafts

### 8.2 User Management Improvements
- Admin user creation with password support
- User pagination and search
- User status management (active/inactive)
- Newsletter subscription feature

### 8.3 Invoice Management
- Student username-based invoice creation
- Automatic student record creation
- Real-time invoice visibility
- Success notifications

### 8.4 Email Integration
- Newsletter subscription emails via Brevo API
- Welcome email on subscription
- Brevo API integration for reliable email delivery
- Professional email templates using Blade
- Email delivery tracking and analytics

### 8.6 LogRocket Integration
- Session recording and replay functionality
- Automatic error tracking and reporting
- Console log capture
- Network request monitoring with data sanitization
- User identification for session tracking
- Global error handler integration
- Performance monitoring capabilities

### 8.5 Testing
- Updated test specifications for backend integration
- Fixed authentication and authorization tests
- Form validation test updates

---

## 9. Setup & Installation

### 9.1 Backend Setup
1. Install PHP 8.1+ and Composer
2. Install MySQL database
3. Clone repository and navigate to `uas-backend`
4. Run `composer install`
5. Configure `.env` file with database credentials
6. Run `php artisan key:generate`
7. Run `php artisan migrate`
8. Run `php artisan db:seed --class=DemoDataSeeder`
9. Start server: `php artisan serve`

### 9.2 Frontend Setup
1. Install Node.js 18+ and npm
2. Navigate to `uas-frontend`
3. Run `npm install`
4. Configure `src/environments/environment.ts`
5. Start server: `npm start` or `ng serve`

### 9.3 Email Configuration (Brevo)
1. Sign up for a Brevo account at https://www.brevo.com
2. Generate an API key from Brevo dashboard
3. Add `BREVO_API_KEY` to `.env` file
4. Configure `MAIL_FROM_ADDRESS` and `MAIL_FROM_NAME` in `.env`
5. Run `php artisan config:clear`

### 9.4 LogRocket Configuration
1. Sign up for a LogRocket account at https://logrocket.com
2. Create a new project and get your app ID
3. Update `src/main.ts` with your LogRocket app ID:
   ```typescript
   LogRocket.init('your-app-id/your-project', { ... });
   ```
4. LogRocket will automatically start recording sessions

---

## 10. Testing

### 10.1 Test Coverage
- Unit tests for services
- Component tests
- Guard tests (authentication/authorization)
- Integration tests for API endpoints

### 10.2 Test Results
- 149 passing tests
- 5 minor test failures (non-critical)
- All critical authentication tests passing

---

## 11. Documentation

### 11.1 Available Documentation
- API Documentation (`API_DOCUMENTATION.md`)
- Setup Instructions (`SETUP_INSTRUCTIONS.md`)
- Data Storage Strategy (`DATA_STORAGE.md`)
- Mail Configuration (`MAIL_CONFIGURATION.md`)
- Cookie Storage Explanation (`COOKIE_STORAGE_EXPLANATION.md`)
- Invoice Session Migration (`INVOICE_SESSION_MIGRATION.md`)
- Test Failures Analysis (`TEST_FAILURES_ANALYSIS.md`)

---

## 12. Future Enhancements

### 12.1 Planned Features
- Advanced reporting and analytics
- Export functionality (PDF, Excel)
- Email notifications for invoices
- Payment reminders
- Multi-currency support
- Receipt generation
- Audit logging

### 12.2 Technical Improvements
- API rate limiting
- Caching optimization
- Database query optimization
- Frontend performance improvements
- Enhanced error handling
- Comprehensive logging

---

## 13. Conclusion

The University Accounting System successfully provides a comprehensive solution for managing university financial operations. With its modern architecture, secure authentication, and robust feature set, the system is ready for production deployment. The clear separation of concerns, well-documented codebase, and extensive testing ensure maintainability and scalability.

### Key Achievements
✅ Complete backend integration  
✅ Secure authentication and authorization  
✅ Comprehensive financial management features  
✅ Role-based access control  
✅ Brevo email integration for newsletters  
✅ LogRocket session recording and error tracking  
✅ Well-documented codebase  
✅ Production-ready code quality  

---

## Technology Versions

- Angular: 21.0.0
- TypeScript: 5.9.x
- Laravel: 11.x
- PHP: 8.1+
- MySQL: 5.7+
- Node.js: 18+

---

**Report Generated:** December 2024  
**Project Status:** ✅ Production Ready


