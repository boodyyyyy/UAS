export enum UserRole {
  ADMIN = 'admin',
  ACCOUNTING = 'accounting',
  STUDENT = 'student'
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  picture?: string;
  password: string;
  creditCard?: {
    number: string;
    expiry: string;
    cvv: string;
  };
  role: UserRole;
  createdAt: Date;
  isActive: boolean;
  newsletterSubscribed?: boolean;
}

