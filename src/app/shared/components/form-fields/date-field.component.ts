import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'app-date-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <mat-form-field appearance="outline" class="form-field">
      <mat-label>{{ field.label }}</mat-label>
      <input 
        matInput 
        [matDatepicker]="picker"
        [formControlName]="field.id"
        [readonly]="isDisabled"
        [min]="field.attributes?.min"
        [max]="field.attributes?.max">
      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
      <mat-hint *ngIf="hasHint">{{ hint }}</mat-hint>
      
      <!-- Error Messages -->
      <mat-error *ngIf="hasError('required')">
        {{ getValidationMessage('required') }}
      </mat-error>
      <mat-error *ngIf="hasError('matDatepickerMin')">
        Date must be after minimum allowed date
      </mat-error>
      <mat-error *ngIf="hasError('matDatepickerMax')">
        Date must be before maximum allowed date
      </mat-error>
    </mat-form-field>
  `
})
export class DateFieldComponent extends BaseFieldComponent {}
