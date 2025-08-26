import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

import { BaseFieldComponent } from './base-field.component';
import { FieldOption } from '../../models';

@Component({
  selector: 'app-radio-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule
  ],
  template: `
    <div class="radio-group full-width">
      <label class="field-label">{{ field.label }}</label>
      <mat-radio-group 
        [formControlName]="field.id" 
        class="radio-group-content"
        [disabled]="isDisabled">
        <mat-radio-button 
          *ngFor="let option of options; trackBy: trackByOptionValue"
          [value]="option.value"
          [disabled]="option.disabled"
          class="radio-option">
          {{ option.label }}
        </mat-radio-button>
      </mat-radio-group>
      
      <div *ngIf="hasHint" class="field-hint">{{ hint }}</div>
      
      <!-- Error Messages -->
      <div *ngIf="hasError('required')" class="field-error">
        {{ getValidationMessage('required') }}
      </div>
    </div>
  `,
  styles: [`
    .radio-group {
      margin-bottom: 16px;
    }
    
    .field-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
      margin-bottom: 8px;
    }
    
    .radio-group-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .radio-option {
      margin-bottom: 4px;
    }
    
    .field-hint {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;
    }
    
    .field-error {
      font-size: 12px;
      color: #f44336;
      margin-top: 4px;
    }
  `]
})
export class RadioFieldComponent extends BaseFieldComponent {
  @Input() options: FieldOption[] = [];

  /**
   * TrackBy function for options
   */
  trackByOptionValue(index: number, option: FieldOption): any {
    return option.value;
  }
}
