import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'app-number-field',
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
        type="number"
        [formControlName]="field.id"
        [placeholder]="placeholder"
        [readonly]="isDisabled"
        [min]="field.attributes?.min"
        [max]="field.attributes?.max"
        [step]="field.attributes?.step">
      <mat-hint *ngIf="hasHint">{{ hint }}</mat-hint>
      
      <!-- Error Messages -->
      <mat-error *ngIf="hasError('required')">
        {{ getValidationMessage('required') }}
      </mat-error>
      <mat-error *ngIf="hasError('min')">
        {{ getValidationMessage('min') }}
      </mat-error>
      <mat-error *ngIf="hasError('max')">
        {{ getValidationMessage('max') }}
      </mat-error>
    </mat-form-field>
  `
})
export class NumberFieldComponent extends BaseFieldComponent {}
