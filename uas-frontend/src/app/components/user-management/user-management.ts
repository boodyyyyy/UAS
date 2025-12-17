import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement implements OnInit {
  users: any[] = [];
  showCreateForm = false;
  userForm: FormGroup;
  roles = [UserRole.STUDENT, UserRole.ACCOUNTING, UserRole.ADMIN];
  isLoading = false;
  errorMessage = '';
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private apiService: ApiService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
      role: [UserRole.STUDENT, [Validators.required]],
      isActive: [true]
    }, {
      validators: [this.passwordMatchValidator]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const passwordConfirmation = form.get('password_confirmation');
    if (password && passwordConfirmation && password.value !== passwordConfirmation.value) {
      passwordConfirmation.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  loadUsers(page: number = 1) {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.apiService.getUsers({ page, per_page: 15 }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.users = response.data;
        this.currentPage = response.meta.current_page;
        this.totalPages = response.meta.last_page;
        this.totalUsers = response.meta.total;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load users';
        console.error('Error loading users:', error);
      }
    });
  }

  createUser() {
    if (this.userForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const userData = {
        username: this.userForm.value.username,
        name: this.userForm.value.name,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        password_confirmation: this.userForm.value.password_confirmation,
        role: this.userForm.value.role
      };

      this.apiService.createUser(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.userForm.reset({ 
            role: UserRole.STUDENT, 
            isActive: true,
            password: '',
            password_confirmation: ''
          });
          this.showCreateForm = false;
          this.loadUsers(this.currentPage); // Reload users list
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || error.error?.errors 
            ? Object.values(error.error.errors).flat().join(', ')
            : 'Failed to create user';
          console.error('Error creating user:', error);
        }
      });
    }
  }

  toggleUserStatus(user: any) {
    this.isLoading = true;
    this.errorMessage = '';
    
    // API expects snake_case, but we need to send it as is_active
    this.apiService.updateUser(parseInt(user.id), { is_active: !user.isActive } as any).subscribe({
      next: () => {
        this.isLoading = false;
        user.isActive = !user.isActive;
        this.loadUsers(this.currentPage); // Reload to get updated data
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update user status';
        console.error('Error updating user status:', error);
      }
    });
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.apiService.deleteUser(parseInt(userId)).subscribe({
        next: () => {
          this.isLoading = false;
          this.loadUsers(this.currentPage); // Reload users list
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to delete user';
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadUsers(page);
    }
  }

  // Expose Math to template
  Math = Math;
}

