/**
 * Form Schema Interfaces - Optimized
 * Defines only the necessary structure for dynamic form rendering
 */

import { JsonValue } from './core.types';

// Core field types actually used in the application
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'textarea';

// Basic validator types actually used
export type ValidatorType = 
  | 'required' 
  | 'email' 
  | 'min' 
  | 'max' 
  | 'minlength' 
  | 'maxlength';

// Simple validator interface
export interface FieldValidator {
  name: ValidatorType;
  message?: string;
  args?: number | string; // Simplified args type
}

// Field option interface
export interface FieldOption {
  value: JsonValue;
  label: string;
  disabled?: boolean;
}

// Field option group interface (for grouped selects)
export interface FieldOptionGroup {
  label: string;
  options: FieldOption[];
}

// Core form field interface with only necessary properties
export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  default?: JsonValue;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  validators?: FieldValidator[];
  options?: FieldOption[];
  attributes?: { [key: string]: any }; // For additional HTML attributes like rows, etc.
  visibleWhen?: ConditionalRule[]; // For conditional visibility
}

// Core form section interface
export interface FormSection {
  id: string;
  title: string;
  collapsible?: boolean;
  collapsed?: boolean;
  repeatable?: boolean;
  minRepeats?: number;
  maxRepeats?: number;
  fields: FormField[];
  visibleWhen?: ConditionalRule[]; // For conditional section visibility
}

// Core form schema interface
export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
}

// Form submission data type
export interface FormSubmissionData {
  [sectionId: string]: SectionData;
}

export interface SectionData {
  [fieldId: string]: JsonValue;
}

// Simplified form configuration - only includes actually used properties
export interface DynamicFormConfig {
  validation?: {
    mode?: 'onChange' | 'onBlur' | 'onSubmit';
    debounceTime?: number;
  };
  
  conditionalLogic?: {
    enabled?: boolean;
  };
}

// Form validation error interface
export interface FormValidationError {
  fieldId: string;
  sectionId: string;
  fieldPath: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
  timestamp: Date;
}

// Conditional rule interface for future use
export interface ConditionalRule {
  fieldId: string;
  operator: ConditionalOperator;
  value: JsonValue;
}

// Conditional operator type
export type ConditionalOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'contains' 
  | 'notContains' 
  | 'greaterThan' 
  | 'lessThan' 
  | 'isEmpty' 
  | 'isNotEmpty';

