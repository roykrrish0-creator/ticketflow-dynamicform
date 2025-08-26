import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'app-textarea-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <mat-form-field appearance="outline" class="form-field full-width">
      <mat-label>{{ field.label }}</mat-label>
      <textarea 
        matInput 
        [formControlName]="field.id"
        [placeholder]="placeholder"
        [readonly]="isDisabled"
        [rows]="field.attributes?.rows || 3"
        [attr.maxlength]="field.attributes?.maxlength">
      </textarea>
      <mat-hint *ngIf="hasHint">{{ hint }}</mat-hint>
      
      <!-- Error Messages -->
      <mat-error *ngIf="hasError('required')">
        {{ getValidationMessage('required') }}
      </mat-error>
      <mat-error *ngIf="hasError('minlength')">
        {{ getValidationMessage('minlength') }}
      </mat-error>
      <mat-error *ngIf="hasError('maxlength')">
        {{ getValidationMessage('maxlength') }}
      </mat-error>
    </mat-form-field>
  `
})
export class TextareaFieldComponent extends BaseFieldComponent {}
