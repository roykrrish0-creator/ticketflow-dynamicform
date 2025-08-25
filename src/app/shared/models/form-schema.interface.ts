/**
 * Form Schema Interfaces
 * Defines the structure for dynamic form rendering with improved type safety
 */

import { BaseEntity, UUID, Timestamp, JsonValue, ValidationError, Result } from './core.types';

// Enhanced field types with better categorization
export type InputFieldType = 'text' | 'email' | 'password' | 'url' | 'tel';
export type NumberFieldType = 'number' | 'range' | 'currency';
export type DateFieldType = 'date' | 'datetime' | 'time' | 'month' | 'week';
export type ChoiceFieldType = 'select' | 'radio' | 'checkbox' | 'multiselect';
export type TextFieldType = 'textarea' | 'richtext' | 'markdown';
export type FileFieldType = 'file' | 'image' | 'document';
export type LayoutFieldType = 'group' | 'section' | 'divider' | 'spacer';
export type AdvancedFieldType = 'signature' | 'location' | 'rating' | 'color';

export type FieldType = 
  | InputFieldType 
  | NumberFieldType 
  | DateFieldType 
  | ChoiceFieldType 
  | TextFieldType 
  | FileFieldType 
  | LayoutFieldType 
  | AdvancedFieldType;

// Enhanced validator types
export type BasicValidatorType = 'required' | 'email' | 'url';
export type LengthValidatorType = 'minlength' | 'maxlength' | 'length';
export type NumericValidatorType = 'min' | 'max' | 'range';
export type PatternValidatorType = 'pattern' | 'format';
export type CustomValidatorType = 'custom' | 'async';

export type ValidatorType = 
  | BasicValidatorType 
  | LengthValidatorType 
  | NumericValidatorType 
  | PatternValidatorType 
  | CustomValidatorType;

// Enhanced conditional operators
export type ComparisonOperator = 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual';
export type StringOperator = 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'regex';
export type ArrayOperator = 'includes' | 'excludes' | 'intersects';
export type ExistenceOperator = 'isEmpty' | 'isNotEmpty' | 'isNull' | 'isNotNull';
export type LogicalOperator = 'and' | 'or' | 'not';

export type ConditionalOperator = 
  | ComparisonOperator 
  | StringOperator 
  | ArrayOperator 
  | ExistenceOperator 
  | LogicalOperator;

// Enhanced validator interface with better type safety
export interface FieldValidator {
  name: ValidatorType;
  args?: ValidationArgs;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
  async?: boolean;
  customFunction?: string; // Reference to custom validator function
}

type ValidationArgs = 
  | string 
  | number 
  | RegExp 
  | { min?: number; max?: number } 
  | { [key: string]: JsonValue };

// Enhanced conditional rule with complex logic support
export interface ConditionalRule {
  fieldId: string;
  operator: ConditionalOperator;
  value: JsonValue;
  logicalOperator?: 'and' | 'or'; // For combining with next rule
  negate?: boolean; // Invert the result
  caseSensitive?: boolean; // For string operations
}

// Enhanced field options with grouping and dynamic loading
export interface FieldOption {
  value: JsonValue;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: string;
  group?: string;
  metadata?: JsonValue;
}

export interface FieldOptionGroup {
  label: string;
  options: FieldOption[];
  disabled?: boolean;
  collapsible?: boolean;
}

export interface DynamicOptionsConfig {
  url?: string;
  method?: 'GET' | 'POST';
  dependsOn?: string[]; // Field IDs that trigger reload
  params?: { [key: string]: string };
  transform?: string; // Function name to transform response
  cache?: boolean;
  cacheTimeout?: number;
}

export interface FieldAttributes {
  placeholder?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  cols?: number;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  accept?: string; // For file inputs
  maxFileSize?: number; // In bytes
  allowedFileTypes?: string[];
  [key: string]: any;
}

// Enhanced form field interface with better type safety and features
export interface FormField {
  id: UUID;
  name: string; // HTML name attribute
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  helpText?: string;
  default?: JsonValue;
  validators?: FieldValidator[];
  options?: FieldOption[] | FieldOptionGroup[];
  dynamicOptions?: DynamicOptionsConfig;
  visibleWhen?: ConditionalRule[];
  enabledWhen?: ConditionalRule[];
  readOnly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  attributes?: FieldAttributes;
  children?: FormField[]; // For group/nested fields
  order?: number;
  width?: number | string; // CSS width
  cssClass?: string[];
  styles?: { [key: string]: string };
  tooltip?: string;
  icon?: string;
  prefix?: string;
  suffix?: string;
  maxLength?: number;
  tabIndex?: number;
  ariaLabel?: string;
  dataAttributes?: { [key: string]: string };
  customProperties?: JsonValue;
}

// Enhanced form section with layout and behavior options
export interface FormSection extends BaseEntity {
  name: string;
  title: string;
  description?: string;
  icon?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  repeatable?: boolean;
  maxRepeats?: number;
  minRepeats?: number;
  addButtonText?: string;
  removeButtonText?: string;
  fields: FormField[];
  layout?: {
    type: 'default' | 'grid' | 'flex' | 'tabs' | 'accordion';
    columns?: number;
    spacing?: 'tight' | 'normal' | 'loose';
    alignment?: 'left' | 'center' | 'right';
  };
  visibleWhen?: ConditionalRule[];
  enabledWhen?: ConditionalRule[];
  order?: number;
  cssClass?: string[];
  styles?: { [key: string]: string };
  validation?: {
    validateOnAdd?: boolean;
    validateOnRemove?: boolean;
    customValidation?: string;
  };
}

// Enhanced form schema with versioning and metadata
export interface FormSchema extends BaseEntity {
  name: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  schemaVersion: string; // Renamed to avoid conflict with BaseEntity.version
  status: 'draft' | 'published' | 'archived';
  sections: FormSection[];
  configuration?: DynamicFormConfig;
  permissions?: {
    view?: string[];
    edit?: string[];
    submit?: string[];
    admin?: string[];
  };
  localization?: {
    [locale: string]: {
      title?: string;
      description?: string;
      sections?: { [sectionId: string]: Partial<FormSection> };
      fields?: { [fieldId: string]: Partial<FormField> };
    };
  };
  customValidation?: string; // Reference to custom validation function
  onSubmit?: {
    url?: string;
    method?: 'POST' | 'PUT';
    transform?: string;
    successMessage?: string;
    errorMessage?: string;
  };
  hooks?: {
    beforeRender?: string;
    afterRender?: string;
    beforeSubmit?: string;
    afterSubmit?: string;
    onFieldChange?: string;
    onSectionChange?: string;
  };
}

// Enhanced validation error with context
export interface FormValidationError extends ValidationError {
  fieldId: UUID;
  sectionId: UUID;
  sectionIndex?: number; // For repeatable sections
  fieldPath: string; // Full path to field (e.g., 'section1.field2')
  severity: 'error' | 'warning' | 'info';
  timestamp: Timestamp;
  context?: JsonValue;
}

// Type-safe form submission data
export interface FormSubmissionData {
  [sectionId: string]: SectionData | SectionData[];
}

export interface SectionData {
  [fieldId: string]: JsonValue;
}

// Enhanced form configuration with performance and UX options
export interface DynamicFormConfig {
  // Validation settings
  validation?: {
    mode: 'onChange' | 'onBlur' | 'onSubmit' | 'manual';
    debounceTime: number;
    showInlineErrors: boolean;
    showSummary: boolean;
    scrollToFirstError: boolean;
    highlightInvalidFields: boolean;
  };
  
  // Auto-save settings
  autoSave?: {
    enabled: boolean;
    interval: number; // milliseconds
    showIndicator: boolean;
    onlyIfValid: boolean;
  };
  
  // Conditional logic settings
  conditionalLogic?: {
    enabled: boolean;
    animateTransitions: boolean;
    evaluationMode: 'lazy' | 'eager';
    debugMode: boolean;
  };
  
  // UI/UX settings
  ui?: {
    theme: 'light' | 'dark' | 'auto';
    density: 'compact' | 'comfortable' | 'spacious';
    showProgress: boolean;
    showFieldNumbers: boolean;
    showRequiredIndicator: boolean;
    focusFirstField: boolean;
  };
  
  // Performance settings
  performance?: {
    virtualScrolling: boolean;
    lazyLoadSections: boolean;
    enableMemoization: boolean;
    batchUpdates: boolean;
  };
  
  // Accessibility settings
  accessibility?: {
    announceChanges: boolean;
    keyboardNavigation: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  
  // Localization
  localization?: {
    locale: string;
    dateFormat: string;
    numberFormat: string;
    currency: string;
    timezone: string;
  };
}

// Form state management interfaces
export interface FormState {
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
  errors: FormValidationError[];
  warnings: FormValidationError[];
  lastSaved?: Timestamp;
  currentStep?: number;
  totalSteps?: number;
}

// Form event interfaces
export interface FormEvent<T = any> {
  type: FormEventType;
  formId: UUID;
  timestamp: Timestamp;
  data: T;
  source: 'user' | 'system' | 'validation';
}

export type FormEventType = 
  | 'field-change'
  | 'field-focus' 
  | 'field-blur'
  | 'section-add'
  | 'section-remove'
  | 'form-submit'
  | 'form-reset'
  | 'form-save'
  | 'validation-error'
  | 'conditional-change';

// Form builder interfaces for creating forms dynamically
export interface FormBuilder {
  addSection(section: Omit<FormSection, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'version'>): FormBuilder;
  addField(sectionId: UUID, field: Omit<FormField, 'id'>): FormBuilder;
  removeSection(sectionId: UUID): FormBuilder;
  removeField(sectionId: UUID, fieldId: UUID): FormBuilder;
  updateSection(sectionId: UUID, updates: Partial<FormSection>): FormBuilder;
  updateField(sectionId: UUID, fieldId: UUID, updates: Partial<FormField>): FormBuilder;
  build(): FormSchema;
  validate(): Result<FormSchema, ValidationError[]>;
  clone(): FormBuilder;
}
