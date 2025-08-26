import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <mat-form-field appearance="outline" class="form-field">
      <mat-label>{{ field.label }}</mat-label>
      <input 
        matInput 
        [formControlName]="field.id"
        [placeholder]="placeholder"
        [readonly]="isDisabled"
        [type]="field.inputType || 'text'"
        [attr.autocomplete]="field.attributes?.autocomplete">
      <mat-hint *ngIf="hasHint">{{ hint }}</mat-hint>
      
      <!-- Error Messages -->
      <mat-error *ngIf="hasError('required')">
        {{ getValidationMessage('required') }}
      </mat-error>
      <mat-error *ngIf="hasError('email')">
        {{ getValidationMessage('email') }}
      </mat-error>
      <mat-error *ngIf="hasError('minlength')">
        {{ getValidationMessage('minlength') }}
      </mat-error>
      <mat-error *ngIf="hasError('maxlength')">
        {{ getValidationMessage('maxlength') }}
      </mat-error>
      <mat-error *ngIf="hasError('pattern')">
        {{ getValidationMessage('pattern') }}
      </mat-error>
    </mat-form-field>
  `
})
export class TextFieldComponent extends BaseFieldComponent {}
