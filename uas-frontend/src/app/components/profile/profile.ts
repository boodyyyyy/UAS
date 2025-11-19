import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  currentUser = this.authService.getCurrentUser();
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      picture: [''],
      creditCard: this.fb.group({
        number: [''],
        expiry: [''],
        cvv: ['']
      }),
      preferences: this.fb.group({
        theme: ['light'],
        notifications: [true],
        language: ['en']
      })
    });
  }

  ngOnInit() {
    if (this.currentUser) {
      this.profileForm.patchValue({
        username: this.currentUser.username,
        name: this.currentUser.name,
        email: this.currentUser.email,
        picture: this.currentUser.picture || '',
        creditCard: this.currentUser.creditCard || { number: '', expiry: '', cvv: '' },
        preferences: this.currentUser.preferences || { theme: 'light', notifications: true, language: 'en' }
      });
    }
  }

  onSubmit() {
    if (this.profileForm.valid && this.currentUser) {
      const formValue = this.profileForm.value;
      const updatedUser = {
        ...this.currentUser,
        username: formValue.username,
        name: formValue.name,
        email: formValue.email,
        picture: formValue.picture || undefined,
        creditCard: formValue.creditCard.number ? formValue.creditCard : undefined,
        preferences: formValue.preferences
      };
      
      this.authService.updateUser(updatedUser);
      this.successMessage = 'Profile updated successfully!';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }
}
