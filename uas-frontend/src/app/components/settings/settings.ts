import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  settingsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      paymentMethods: [''],
      paymentTerms: [''],
      budgetCategories: [''],
      systemName: ['University Accounting System'],
      systemEmail: ['admin@university.edu']
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    const stored = localStorage.getItem('uas_system_settings');
    if (stored) {
      this.settingsForm.patchValue(JSON.parse(stored));
    }
  }

  saveSettings() {
    localStorage.setItem('uas_system_settings', JSON.stringify(this.settingsForm.value));
    alert('Settings saved successfully!');
  }
}

