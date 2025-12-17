import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  profileForm: FormGroup;
  currentUser: any = {};
  successMessage = '';
  selectedFileName = '';
  private userSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
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
    // Initialize currentUser from service
    this.currentUser = this.userService.getUser();
    
    // Subscribe to user changes
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.currentUser = user;
      this.profileForm.patchValue({
        username: user.username,
        name: user.name,
        email: user.email,
        picture: user.picture || '',
        creditCard: user.creditCard || { number: '', expiry: '', cvv: '' },
        preferences: user.preferences || { theme: 'light', notifications: true, language: 'en' }
      }, { emitEvent: false });
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  getRoleLabel(): string {
    const role = this.currentUser.role || 'student';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  triggerFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFileName = file.name;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result;
        this.updateProfilePicture(base64String);
      };
      reader.readAsDataURL(file);
    }
  }

  onPictureUrlChange(): void {
    const url = this.profileForm.get('picture')?.value;
    if (url) {
      // Validate URL
      try {
        new URL(url);
        this.updateProfilePicture(url);
      } catch {
        alert('Please enter a valid URL');
      }
    }
  }

  private updateProfilePicture(pictureUrl: string): void {
    this.profileForm.patchValue({ picture: pictureUrl });
    
    const userId = this.currentUser.id;
    
    // 1. Update UserService (RAM + triggers UI updates)
    this.userService.updateUser({ picture: pictureUrl });
    
    // 2. Save to user-specific localStorage (for quick access)
    localStorage.setItem(`profile_picture_${userId}`, pictureUrl);
    
    // 3. Update users array in localStorage (CRITICAL - so it persists across sessions)
    this.updateUserInLocalStorage({ picture: pictureUrl });
    
    // 4. Update local currentUser object
    this.currentUser = { ...this.currentUser, picture: pictureUrl };
  }

  /**
   * Updates the user in the users array in localStorage
   * This ensures changes persist across page refreshes and sessions
   */
  private updateUserInLocalStorage(updates: any): void {
    const userId = this.currentUser.id;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find the user and update
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      const userId = this.currentUser.id;
      
      // Prepare updates
      const updates = {
        username: formValue.username,
        name: formValue.name,
        email: formValue.email,
        picture: formValue.picture || '',
        creditCard: formValue.creditCard.number ? formValue.creditCard : { number: '', expiry: '', cvv: '' },
        preferences: formValue.preferences
      };
      
      // 1. Update UserService (RAM + triggers UI updates)
      this.userService.updateUser(updates);

      // 2. Save profile picture to user-specific localStorage
      if (formValue.picture) {
        localStorage.setItem(`profile_picture_${userId}`, formValue.picture);
      } else {
        localStorage.removeItem(`profile_picture_${userId}`);
      }
      
      // 3. Update users array in localStorage (CRITICAL FIX)
      this.updateUserInLocalStorage(updates);

      this.successMessage = 'Profile updated successfully!';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }
}