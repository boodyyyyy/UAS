import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
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

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: [UserRole.STUDENT, [Validators.required]],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    // In a real app, this would fetch from a backend
    // For now, we'll use localStorage to store users
    const stored = localStorage.getItem('users');
    if (stored) {
      this.users = JSON.parse(stored);
    } else {
      // Initialize with current user
      const currentUser = this.userService.getUser();
      this.users = [currentUser];
      this.saveUsers();
    }
  }

  saveUsers() {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  createUser() {
    if (this.userForm.valid) {
      const newUser = {
        id: Date.now().toString(),
        ...this.userForm.value,
        picture: '',
        creditCard: { number: '', expiry: '', cvv: '' },
        preferences: { theme: 'light', notifications: true, language: 'en' }
      };
      this.users.push(newUser);
      this.saveUsers();
      this.userForm.reset({ role: UserRole.STUDENT, isActive: true });
      this.showCreateForm = false;
    }
  }

  toggleUserStatus(user: any) {
    user.isActive = !user.isActive;
    this.saveUsers();
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.users = this.users.filter(u => u.id !== userId);
      this.saveUsers();
    }
  }
}

