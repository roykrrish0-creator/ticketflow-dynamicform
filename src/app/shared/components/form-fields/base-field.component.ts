import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { FormField } from '../../models';

export interface ValidationEvent {
  field: FormField;
  errorType: string;
}

@Component({
  selector: 'app-base-field',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export abstract class BaseFieldComponent {
  @Input() field!: FormField;
  @Input() formGroup!: FormGroup;
  @Output() validationMessage = new EventEmitter<ValidationEvent>();

  /**
   * Get the form control for this field
   */
  get control(): AbstractControl | null {
    return this.formGroup?.get(this.field?.id) || null;
  }

  /**
   * Check if field has specific error
   */
  hasError(errorType: string): boolean {
    return this.control?.hasError(errorType) && (this.control?.dirty || this.control?.touched) || false;
  }

  /**
   * Get validation message for error type
   */
  getValidationMessage(errorType: string): string {
    this.validationMessage.emit({ field: this.field, errorType });
    
    const validator = this.field.validators?.find(v => v.name === errorType);
    if (validator?.message) {
      return validator.message;
    }
    
    // Default messages
    switch (errorType) {
      case 'required':
        return `${this.field.label} is required`;
      case 'email':
        return 'Please enter a valid email address';
      case 'min':
        return `${this.field.label} must be greater than minimum value`;
      case 'max':
        return `${this.field.label} must be less than maximum value`;
      case 'minlength':
        return `${this.field.label} must be at least ${validator?.args} characters`;
      case 'maxlength':
        return `${this.field.label} must not exceed ${validator?.args} characters`;
      default:
        return `${this.field.label} is invalid`;
    }
  }

  /**
   * Check if field is disabled
   */
  get isDisabled(): boolean {
    return this.field.readOnly || this.control?.disabled || false;
  }

  /**
   * Get field placeholder
   */
  get placeholder(): string {
    return this.field.placeholder || '';
  }

  /**
   * Get field hint text
   */
  get hint(): string {
    return this.field.attributes?.['hint'] || '';
  }

  /**
   * Check if field has hint
   */
  get hasHint(): boolean {
    return !!this.hint;
  }
}
