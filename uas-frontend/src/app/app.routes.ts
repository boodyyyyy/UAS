import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { UserRole } from './models/user.model';

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
    canActivate: [authGuard],
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
        loadComponent: () => import('./components/staff-payroll/staff-payroll').then(m => m.StaffPayroll),
        canActivate: [authGuard],
        data: { roles: [UserRole.ADMIN, UserRole.ACCOUNTING] }
      },
      {
        path: 'department-budget',
        loadComponent: () => import('./components/department-budget/department-budget').then(m => m.DepartmentBudget),
        canActivate: [authGuard],
        data: { roles: [UserRole.ADMIN, UserRole.ACCOUNTING] }
      },
      {
        path: 'student-fees',
        loadComponent: () => import('./components/student-fees/student-fees').then(m => m.StudentFees),
        canActivate: [authGuard]
      }
    ]
  }
];
