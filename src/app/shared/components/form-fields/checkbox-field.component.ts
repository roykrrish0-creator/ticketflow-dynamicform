import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { BaseFieldComponent } from './base-field.component';

@Component({
  selector: 'app-checkbox-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCheckboxModule
  ],
  template: `
    <div class="checkbox-field">
      <mat-checkbox 
        [formControlName]="field.id" 
        [disabled]="isDisabled">
        {{ field.label }}
      </mat-checkbox>
      <div *ngIf="hasHint" class="field-hint">{{ hint }}</div>
    </div>
  `,
  styles: [`
    .checkbox-field {
      margin-bottom: 16px;
    }
    
    .field-hint {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;
      margin-left: 32px; /* Align with checkbox text */
    }
  `]
})
export class CheckboxFieldComponent extends BaseFieldComponent {}
