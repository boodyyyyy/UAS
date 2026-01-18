# University Accounting System (UAS)

A comprehensive web-based application for managing university financial operations, including student fee management, staff payroll processing, and department budget tracking.

## 🚀 Quick Start

### Prerequisites
- PHP 8.1+ and Composer
- Node.js 18+ and npm
- MySQL 5.7+
- Git

### Backend Setup
```bash
cd uas-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=DemoDataSeeder
php artisan serve
```

### Frontend Setup
```bash
cd uas-frontend
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:8000

## 📋 Features

- **User Management**: Registration, authentication, role-based access control
- **Student Fee Management**: Invoice creation, payment processing, status tracking
- **Payment Processing**: Multiple payment methods, transaction history
- **Staff Payroll**: Payroll management and reporting
- **Department Budget**: Budget allocation, tracking, and analytics
- **Financial Reporting**: Comprehensive financial summaries and analytics
- **Newsletter Subscription**: Email newsletter with Brevo integration
- **Session Recording**: LogRocket integration for error tracking and user session replay

## 🛠️ Technology Stack

### Frontend
- Angular 21
- TypeScript 5.9
- Chart.js / ng2-charts
- RxJS
- SCSS

### Backend
- Laravel 11
- PHP 8.1+
- MySQL 5.7+
- Laravel Sanctum (Authentication)

### Third-Party Services
- **LogRocket**: Session recording and error tracking
- **Brevo**: Email delivery service for newsletters

## 👥 Team

**Team Name:** 404 Balance not found

- Ahmed Megahed (13001265)
- Hassan Islam (13001118)
- Jana Raed (13002886)
- Abdelrahman Saeed (13004425)

## 📚 Documentation

- [API Documentation](uas-backend/README_API.md)
- [Setup Instructions](uas-backend/SETUP_INSTRUCTIONS.md)
- [Project Report](PROJECT_REPORT.md)

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=uas
DB_USERNAME=root
DB_PASSWORD=

BREVO_API_KEY=your_brevo_api_key
MAIL_FROM_ADDRESS=noreply@uas.edu
MAIL_FROM_NAME="University Accounting System"
```

#### Frontend (src/environments/environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  // ... other configurations
};
```

## 🧪 Testing

### Frontend Tests
```bash
cd uas-frontend
npm test
```

## 📦 Project Structure

```
UAS/
├── uas-backend/          # Laravel backend API
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
├── uas-frontend/         # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── README.md
```

## 🔒 Security Features

- Laravel Sanctum token-based authentication
- HTTP-only cookies for secure token storage
- Role-based access control (RBAC)
- SQL injection prevention (Eloquent ORM)
- XSS protection
- CSRF token validation
- Input validation and sanitization

## 📊 Monitoring & Analytics

### LogRocket Integration
The application uses LogRocket for:
- User session recording and replay
- Error tracking and debugging
- Performance monitoring
- User behavior analytics

LogRocket is initialized in `uas-frontend/src/main.ts` and automatically captures:
- Console logs
- Network requests (with sensitive data sanitized)
- User interactions
- JavaScript errors

### Brevo Email Service
Newsletter subscription emails are sent via Brevo API:
- Welcome emails on subscription
- Professional email templates
- Reliable email delivery
- Email tracking and analytics

## 📝 License

This project is developed for educational purposes.

## 🤝 Contributing

This is a university project. For contributions, please contact the team members.

---

**Version:** 1.0  
**Last Updated:** December 2025


