import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home').then(m => m.Home)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup').then(m => m.Signup)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile').then(m => m.Profile)
      },
      {
        path: 'staff-payroll',
        loadComponent: () => import('./components/staff-payroll/staff-payroll').then(m => m.StaffPayroll)
      },
      {
        path: 'department-budget',
        loadComponent: () => import('./components/department-budget/department-budget').then(m => m.DepartmentBudget)
      },
      {
        path: 'student-fees',
        loadComponent: () => import('./components/student-fees/student-fees').then(m => m.StudentFees)
      },
      {
        path: 'payment-history',
        loadComponent: () => import('./components/payment-history/payment-history').then(m => m.PaymentHistory)
      },
      {
        path: 'payments',
        loadComponent: () => import('./components/payments/payments').then(m => m.Payments)
      },
      {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports').then(m => m.Reports)
      },
      {
        path: 'user-management',
        loadComponent: () => import('./components/user-management/user-management').then(m => m.UserManagement)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/settings').then(m => m.Settings)
      }
    ]
  }
];
