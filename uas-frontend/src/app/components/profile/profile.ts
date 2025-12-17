import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';
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
    private userService: UserService,
    private apiService: ApiService
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
      newsletterSubscribed: [false]
    });
  }

  ngOnInit() {
    // Initialize currentUser from service
    this.currentUser = this.userService.getUser();
    
    // Load fresh user data from API to get latest newsletter subscription status
    if (this.currentUser?.id) {
      this.apiService.getUser(parseInt(this.currentUser.id)).subscribe({
        next: (response) => {
          const apiUser = response.data;
          this.currentUser = {
            ...this.currentUser,
            name: apiUser.name,
            email: apiUser.email,
            picture: apiUser.picture,
            newsletterSubscribed: apiUser.newsletterSubscribed || false
          };
          this.userService.setUser(this.currentUser);
        },
        error: (error) => {
          console.error('Error loading user data:', error);
        }
      });
    }
    
    // Subscribe to user changes
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.currentUser = user;
      this.profileForm.patchValue({
        username: user.username,
        name: user.name,
        email: user.email,
        picture: user.picture || '',
        creditCard: user.creditCard || { number: '', expiry: '', cvv: '' },
        newsletterSubscribed: user.newsletterSubscribed || false
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
      const userId = parseInt(this.currentUser.id);
      
      // Prepare updates for API (using snake_case for backend)
      const apiUpdates: any = {
        name: formValue.name,
        email: formValue.email,
        picture: formValue.picture || '',
        newsletter_subscribed: formValue.newsletterSubscribed || false
      };
      
      // Update user via API
      this.apiService.updateUser(userId, apiUpdates).subscribe({
        next: (response) => {
          // Update local user service with response data
          const updatedUser = {
            ...this.currentUser,
            name: response.data.name,
            email: response.data.email,
            picture: response.data.picture,
            newsletterSubscribed: response.data.newsletterSubscribed
          };
          
          this.userService.updateUser(updatedUser);
          this.currentUser = updatedUser;
          
          // Save profile picture to user-specific localStorage
          if (formValue.picture) {
            localStorage.setItem(`profile_picture_${userId}`, formValue.picture);
          } else {
            localStorage.removeItem(`profile_picture_${userId}`);
          }
          
          // Update users array in localStorage
          this.updateUserInLocalStorage(updatedUser);
          
          // Show success message
          const wasSubscribed = this.currentUser.newsletterSubscribed || false;
          if (formValue.newsletterSubscribed && !wasSubscribed) {
            this.successMessage = 'Profile updated successfully! Welcome email sent to your inbox.';
          } else if (!formValue.newsletterSubscribed && wasSubscribed) {
            this.successMessage = 'Profile updated successfully! You have been unsubscribed from the newsletter.';
          } else {
            this.successMessage = 'Profile updated successfully!';
          }
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.successMessage = '';
          alert(error.error?.message || 'Failed to update profile. Please try again.');
        }
      });
    }
  }
}