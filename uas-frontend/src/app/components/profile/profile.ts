import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
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
    this.userService.updateUser({ picture: pictureUrl });
    this.currentUser = { ...this.currentUser, picture: pictureUrl };
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      
      // Update user through service
      this.userService.updateUser({
        username: formValue.username,
        name: formValue.name,
        email: formValue.email,
        picture: formValue.picture || '',
        creditCard: formValue.creditCard.number ? formValue.creditCard : { number: '', expiry: '', cvv: '' },
        preferences: formValue.preferences
      });

      this.successMessage = 'Profile updated successfully!';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }
}
