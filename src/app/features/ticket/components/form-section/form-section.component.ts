import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { FormSection, FormField, FieldOption, FieldOptionGroup } from '../../../../shared/models';

@Component({
  selector: 'app-form-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="form-section-container">
      <mat-expansion-panel 
        [expanded]="!section.collapsed"
        class="section-panel">
        
        <!-- Section Header -->
        <mat-expansion-panel-header class="section-header">
          <mat-panel-title class="section-title">
            <mat-icon class="section-icon">{{getSectionIcon()}}</mat-icon>
            <span class="section-title-text">{{section.title}}</span>
          </mat-panel-title>
        </mat-expansion-panel-header>

        <!-- Section Content -->
        <div class="section-content" [formGroup]="formGroup">
          <div class="form-grid">
            <div 
              *ngFor="let field of section.fields; trackBy: trackByFieldId"
              class="form-field-container"
              [ngClass]="getFieldGridClass(field)">
              
              <!-- Text Input -->
              <mat-form-field 
                *ngIf="field.type === 'text'" 
                appearance="outline"
                class="form-field">
                <mat-label>{{field.label}}</mat-label>
                <input 
                  matInput 
                  [formControlName]="field.id"
                  [placeholder]="field.placeholder || ''"
                  [readonly]="field.readOnly">
          <mat-hint *ngIf="field.attributes?.hint">{{field.attributes?.hint}}</mat-hint>
                <mat-error *ngIf="getFieldControl(field.id)?.errors?.['required']">
                  {{getValidationMessage(field, 'required')}}
                </mat-error>
                <mat-error *ngIf="getFieldControl(field.id)?.errors?.['email']">
                  {{getValidationMessage(field, 'email')}}
                </mat-error>
              </mat-form-field>

              <!-- Textarea -->
              <mat-form-field 
                *ngIf="field.type === 'textarea'" 
                appearance="outline"
                class="form-field full-width">
                <mat-label>{{field.label}}</mat-label>
                <textarea 
                  matInput 
                  [formControlName]="field.id"
                  [placeholder]="field.placeholder || ''"
                  [rows]="field.attributes?.rows || 3"
                  [readonly]="field.readOnly">
                </textarea>
                <mat-hint *ngIf="field.attributes?.hint">{{field.attributes?.hint}}</mat-hint>
                <mat-error *ngIf="getFieldControl(field.id)?.errors?.['required']">
                  {{getValidationMessage(field, 'required')}}
                </mat-error>
              </mat-form-field>

              <!-- Select -->
              <mat-form-field 
                *ngIf="field.type === 'select'" 
                appearance="outline"
                class="form-field">
                <mat-label>{{field.label}}</mat-label>
                <mat-select [formControlName]="field.id">
                  <mat-option 
                    *ngFor="let option of getFieldOptions(field); trackBy: trackByOptionValue" 
                    [value]="option.value"
                    [disabled]="option.disabled">
                    {{option.label}}
                  </mat-option>
                </mat-select>
                <mat-hint *ngIf="field.attributes?.hint">{{field.attributes?.hint}}</mat-hint>
                <mat-error *ngIf="getFieldControl(field.id)?.errors?.['required']">
                  {{getValidationMessage(field, 'required')}}
                </mat-error>
              </mat-form-field>

              <!-- Radio Group -->
              <div *ngIf="field.type === 'radio'" class="radio-group full-width">
                <label class="field-label">{{field.label}}</label>
                <mat-radio-group [formControlName]="field.id" class="radio-group-content">
                  <mat-radio-button 
                    *ngFor="let option of getFieldOptions(field); trackBy: trackByOptionValue"
                    [value]="option.value"
                    [disabled]="option.disabled"
                    class="radio-option">
                    {{option.label}}
                  </mat-radio-button>
                </mat-radio-group>
                <div *ngIf="field.attributes?.hint" class="field-hint">{{field.attributes?.hint}}</div>
                <div *ngIf="getFieldControl(field.id)?.errors?.['required']" class="field-error">
                  {{getValidationMessage(field, 'required')}}
                </div>
              </div>

              <!-- Number Input -->
              <mat-form-field 
                *ngIf="field.type === 'number'" 
                appearance="outline"
                class="form-field">
                <mat-label>{{field.label}}</mat-label>
                <input 
                  matInput 
                  type="number"
                  [formControlName]="field.id"
                  [placeholder]="field.placeholder || ''"
                  [readonly]="field.readOnly">
                <mat-hint *ngIf="field.attributes?.hint">{{field.attributes?.hint}}</mat-hint>
                <mat-error *ngIf="getFieldControl(field.id)?.errors?.['required']">
                  {{getValidationMessage(field, 'required')}}
                </mat-error>
              </mat-form-field>

              <!-- Date Input -->
              <mat-form-field 
                *ngIf="field.type === 'date'" 
                appearance="outline"
                class="form-field">
                <mat-label>{{field.label}}</mat-label>
                <input 
                  matInput 
                  [matDatepicker]="picker"
                  [formControlName]="field.id"
                  [readonly]="field.readOnly">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-hint *ngIf="field.attributes?.hint">{{field.attributes?.hint}}</mat-hint>
                <mat-error *ngIf="getFieldControl(field.id)?.errors?.['required']">
                  {{getValidationMessage(field, 'required')}}
                </mat-error>
              </mat-form-field>

              <!-- Checkbox -->
              <div *ngIf="field.type === 'checkbox'" class="checkbox-field">
                <mat-checkbox [formControlName]="field.id" [disabled]="field.readOnly || false">
                  {{field.label}}
                </mat-checkbox>
                <div *ngIf="field.attributes?.hint" class="field-hint">{{field.attributes?.hint}}</div>
              </div>

            </div>
          </div>
        </div>
      </mat-expansion-panel>
    </div>
  `,
  styleUrls: ['./form-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSectionComponent implements OnInit {
  @Input() section!: FormSection;
  @Input() formGroup!: FormGroup;
  @Input() sectionIndex: number = 0;

  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Get section icon based on section content
   */
  getSectionIcon(): string {
    const sectionId = this.section.id.toLowerCase();
    
    if (sectionId.includes('basic') || sectionId.includes('general')) {
      return 'info';
    } else if (sectionId.includes('employee') || sectionId.includes('personal')) {
      return 'person';
    } else if (sectionId.includes('employment') || sectionId.includes('work')) {
      return 'work';
    } else if (sectionId.includes('contact')) {
      return 'contact_mail';
    } else if (sectionId.includes('address')) {
      return 'location_on';
    }
    
    return 'description';
  }

  /**
   * Get field control from form group
   */
  getFieldControl(fieldId: string) {
    return this.formGroup.get(fieldId);
  }

  /**
   * Get validation message for field
   */
  getValidationMessage(field: FormField, errorType: string): string {
    const validator = field.validators?.find(v => v.name === errorType);
    if (validator?.message) {
      return validator.message;
    }
    
    // Default messages
    switch (errorType) {
      case 'required':
        return `${field.label} is required`;
      case 'email':
        return 'Please enter a valid email address';
      case 'min':
        return `${field.label} must be greater than minimum value`;
      case 'max':
        return `${field.label} must be less than maximum value`;
      default:
        return `${field.label} is invalid`;
    }
  }

  /**
   * Get CSS grid class for field layout
   */
  getFieldGridClass(field: FormField): string {
    if (field.type === 'textarea' || field.type === 'radio') {
      return 'full-width';
    }
    return 'half-width';
  }

  /**
   * TrackBy function for fields
   */
  trackByFieldId(index: number, field: FormField): string {
    return field.id;
  }

  /**
   * TrackBy function for options
   */
  trackByOptionValue(index: number, option: any): any {
    return option.value;
  }

  /**
   * Get field options, handling both FieldOption[] and FieldOptionGroup[] types
   */
  getFieldOptions(field: FormField): FieldOption[] {
    if (!field.options) {
      return [];
    }

    // Check if it's an array of FieldOptionGroup
    if (Array.isArray(field.options) && field.options.length > 0) {
      const firstItem = field.options[0];
      // Check if first item has 'options' property (indicating it's a FieldOptionGroup)
      if ('options' in firstItem && Array.isArray(firstItem.options)) {
        // Flatten all options from groups
        return (field.options as FieldOptionGroup[]).reduce((acc: FieldOption[], group) => {
          return acc.concat(group.options);
        }, []);
      }
    }

    // It's already a FieldOption[]
    return field.options as FieldOption[];
  }
}
