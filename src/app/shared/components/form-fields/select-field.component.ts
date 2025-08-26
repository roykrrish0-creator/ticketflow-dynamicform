import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { BaseFieldComponent } from './base-field.component';
import { FieldOption } from '../../models';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  template: `
    <mat-form-field appearance="outline" class="form-field">
      <mat-label>{{ field.label }}</mat-label>
      <mat-select [formControlName]="field.id" [disabled]="isDisabled">
        <mat-option 
          *ngFor="let option of options; trackBy: trackByOptionValue" 
          [value]="option.value"
          [disabled]="option.disabled">
          {{ option.label }}
        </mat-option>
      </mat-select>
      <mat-hint *ngIf="hasHint">{{ hint }}</mat-hint>
      
      <!-- Error Messages -->
      <mat-error *ngIf="hasError('required')">
        {{ getValidationMessage('required') }}
      </mat-error>
    </mat-form-field>
  `
})
export class SelectFieldComponent extends BaseFieldComponent {
  @Input() options: FieldOption[] = [];

  /**
   * TrackBy function for options
   */
  trackByOptionValue(index: number, option: FieldOption): any {
    return option.value;
  }
}
