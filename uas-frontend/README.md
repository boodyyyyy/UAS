# University Accounting System (UAS) - Frontend

A comprehensive Angular-based frontend application for managing university accounting operations including student fees, staff payroll, and department budgets.

## Features

### Core Functionality
- **User Authentication**: Login, Signup, and Profile management
- **Student Fees Management**: Create invoices, mark payments, view payment history
- **Staff Payroll**: Manage employee salaries, allowances, deductions, and generate reports
- **Department Budget**: Track income/expenses with visual charts and transaction history
- **AI Chat Assistant**: Integrated chat widget for user support

### User Roles
- **Admin**: Full access to all features
- **Accounting Personnel**: Access to payroll and budget management
- **Student**: Access to personal fees and payment history

### Technical Features
- **Responsive Design**: Fully responsive layouts for all screen sizes
- **Client-Side Storage**: Uses localStorage, sessionStorage, and cookies appropriately
- **Lazy Loading**: Route-based code splitting for optimal performance
- **Animations**: Smooth transitions and visual feedback
- **Audio Feedback**: Sound effects for user interactions

## Getting Started

### Quick Setup

**Windows Users:** Run the automated setup script:
```bash
cd uas-frontend
setup.bat
```

**All Platforms:** See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Prerequisites
- Node.js (v18 or higher)
- npm (v10 or higher)
- Angular CLI (v21 or higher)

### Quick Installation

1. Navigate to the project directory:
```bash
cd uas-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment (optional):
   - Edit `src/environments/environment.ts`
   - Update `apiUrl` if backend runs on different port
   - Add chatbot API keys if needed

4. Start the development server:
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:4200`

**Note:** Make sure the Laravel backend is running on `http://localhost:8000` before starting the frontend.

## Default Login Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Accounting**: username: `accounting`, password: `accounting123`
- **Student**: username: `student`, password: `student123`

## Project Structure

```
src/app/
├── components/          # Page components
│   ├── home/
│   ├── login/
│   ├── signup/
│   ├── profile/
│   ├── dashboard/
│   ├── student-fees/
│   ├── staff-payroll/
│   └── department-budget/
├── layouts/             # Layout components
│   ├── main-layout/
│   ├── header/
│   └── sidebar/
├── services/           # Business logic services
│   ├── auth.service.ts
│   ├── data.service.ts
│   ├── storage.service.ts
│   └── chat.service.ts
├── models/              # TypeScript interfaces
├── guards/              # Route guards
└── shared/              # Shared components
    └── chat-widget/
```

## Storage Strategy

- **localStorage**: Used for persistent user data, invoices, payments, and other long-term data
- **sessionStorage**: Used for current session data (active user session)
- **Cookies**: Used for user identification that may need to be sent to server

## Development

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## Notes

- All data is stored client-side using browser storage APIs
- The AI chat integration requires configuration of the Together.ai API key in the environment
- Charts in the Department Budget module use placeholder visualizations (ngx-charts can be fully integrated)

## Technologies Used

- Angular 21
- TypeScript 5.9
- SCSS
- ngx-charts (for data visualization)
- ngx-cookie-service (for cookie management)
- Chart.js (for charts and graphs)
- RxJS (for reactive programming)
