import { Component, Input, OnInit, ChangeDetectionStrategy, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, AbstractControl } from '@angular/forms';
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
import { Subject, takeUntil } from 'rxjs';

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
  templateUrl: './form-section.component.html',
  styleUrls: ['./form-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSectionComponent implements OnInit, OnDestroy {
  @Input() section!: FormSection;
  @Input() formGroup!: FormGroup;
  @Input() sectionIndex: number = 0;

  private destroy$ = new Subject<void>();
  private fieldOptionsCache = new Map<string, FieldOption[]>();

  ngOnInit(): void {
    this.validateInputs();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.fieldOptionsCache.clear();
  }

  /**
   * Validate required inputs
   */
  private validateInputs(): void {
    if (!this.section) {
      throw new Error('FormSectionComponent: section input is required');
    }
    if (!this.formGroup) {
      throw new Error('FormSectionComponent: formGroup input is required');
    }
  }

  /**
   * Setup form subscriptions for change detection optimization
   */
  private setupFormSubscriptions(): void {
    // Subscribe to form changes for performance monitoring
    this.formGroup.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Could add custom logic here for form state changes
      });
  }

  /**
   * Get section icon based on section content
   */
  getSectionIcon(): string {
    const sectionId = this.section.id.toLowerCase();
    
    if (sectionId.includes('basic') || sectionId.includes('general')) {
      return 'info';
    } else if (sectionId.includes('employee') || sectionId.includes('personal')) {
      return 'badge';
    } else if (sectionId.includes('employment') || sectionId.includes('work')) {
      return 'business_center';
    } else if (sectionId.includes('contact')) {
      return 'contact_mail';
    } else if (sectionId.includes('address')) {
      return 'place';
    }
    
    return 'article';
  }

  /**
   * Get field control from form group with proper typing
   */
  getFieldControl(fieldId: string): AbstractControl | null {
    return this.formGroup?.get(fieldId) || null;
  }

  /**
   * Check if field has specific error and is touched/dirty
   */
  hasFieldError(fieldId: string, errorType: string): boolean {
    const control = this.getFieldControl(fieldId);
    return !!(control?.hasError(errorType) && (control.dirty || control.touched));
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
   * Get field options with caching for performance
   */
  getFieldOptions(field: FormField): FieldOption[] {
    if (!field.options) {
      return [];
    }

    // Check cache first
    const cacheKey = field.id;
    if (this.fieldOptionsCache.has(cacheKey)) {
      return this.fieldOptionsCache.get(cacheKey)!;
    }

    let options: FieldOption[] = [];

    // Check if it's an array of FieldOptionGroup
    if (Array.isArray(field.options) && field.options.length > 0) {
      const firstItem = field.options[0];
      // Check if first item has 'options' property (indicating it's a FieldOptionGroup)
      if ('options' in firstItem && Array.isArray(firstItem.options)) {
        // Flatten all options from groups
        options = (field.options as FieldOptionGroup[]).reduce((acc: FieldOption[], group) => {
          return acc.concat(group.options);
        }, []);
      } else {
        // It's already a FieldOption[]
        options = field.options as FieldOption[];
      }
    } else {
      options = field.options as FieldOption[];
    }

    // Cache the result
    this.fieldOptionsCache.set(cacheKey, options);
    return options;
  }

  /**
   * Get field by ID for type safety
   */
  getFieldById(fieldId: string): FormField | undefined {
    return this.section.fields.find(field => field.id === fieldId);
  }

  /**
   * Check if section has errors
   */
  get hasErrors(): boolean {
    if (!this.formGroup) return false;
    
    return this.section.fields.some(field => {
      const control = this.getFieldControl(field.id);
      return control && control.invalid && (control.dirty || control.touched);
    });
  }

  /**
   * Get section error count
   */
  get errorCount(): number {
    if (!this.formGroup) return 0;
    
    return this.section.fields.reduce((count, field) => {
      const control = this.getFieldControl(field.id);
      if (control && control.invalid && (control.dirty || control.touched)) {
        return count + Object.keys(control.errors || {}).length;
      }
      return count;
    }, 0);
  }

  /**
   * Get field input type with fallback
   */
  getInputType(field: FormField): string {
    return (field as any).inputType || 'text';
  }

  /**
   * Check if field is disabled with proper boolean handling
   */
  isFieldDisabled(field: FormField): boolean {
    return field.readOnly === true;
  }

  /**
   * Get field attribute with type safety
   */
  getFieldAttribute(field: FormField, attributeName: string): any {
    return field.attributes?.[attributeName] || null;
  }
}
