import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest, debounceTime, distinctUntilChanged } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import {
  FormSchema,
  FormSection,
  FormField,
  FieldType,
  FieldValidator,
  ConditionalRule,
  FormSubmissionData,
  DynamicFormConfig,
  FormValidationError,
  ConditionalOperator,
  ValidatorType
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {
  private readonly fb = inject(FormBuilder);
  
  private readonly defaultConfig: DynamicFormConfig = {
    validation: {
      mode: 'onChange',
      debounceTime: 300,
      showInlineErrors: true,
      showSummary: true,
      scrollToFirstError: true,
      highlightInvalidFields: true
    },
    autoSave: {
      enabled: false,
      interval: 5000,
      showIndicator: true,
      onlyIfValid: false
    },
    conditionalLogic: {
      enabled: true,
      animateTransitions: false,
      evaluationMode: 'lazy',
      debugMode: false
    },
    ui: {
      theme: 'light',
      density: 'comfortable',
      showProgress: true,
      showFieldNumbers: false,
      showRequiredIndicator: true,
      focusFirstField: true
    },
    localization: {
      locale: 'en-US',
      dateFormat: 'MM/dd/yyyy',
      numberFormat: 'en-US',
      currency: 'USD',
      timezone: 'America/New_York'
    }
  };

  /**
   * Creates a reactive form from schema
   */
  createFormFromSchema(schema: FormSchema, config: Partial<DynamicFormConfig> = {}): FormGroup {
    const formConfig = { ...this.defaultConfig, ...config };
    const form = this.fb.group({});

    // Create form controls for each section
    schema.sections.forEach(section => {
      if (section.repeatable) {
        form.addControl(section.id, this.fb.array([]));
        // Add initial instance if required
        if (section.minRepeats && section.minRepeats > 0) {
          const formArray = form.get(section.id) as FormArray;
          for (let i = 0; i < section.minRepeats; i++) {
            formArray.push(this.createSectionGroup(section));
          }
        }
      } else {
        form.addControl(section.id, this.createSectionGroup(section));
      }
    });

    // Set up conditional logic if enabled
    if (formConfig.conditionalLogic?.enabled) {
      this.setupConditionalLogic(form, schema, formConfig);
    }

    // Set up validation
    this.setupValidation(form, schema, formConfig);

    return form;
  }

  /**
   * Creates a form group for a section
   */
  private createSectionGroup(section: FormSection): FormGroup {
    const group = this.fb.group({});

    section.fields.forEach(field => {
      const control = this.createFieldControl(field);
      group.addControl(field.id, control);
    });

    return group;
  }

  /**
   * Creates a form control for a field
   */
  private createFieldControl(field: FormField): AbstractControl {
    let control: AbstractControl;

    switch (field.type) {
      case 'group':
        control = this.fb.group({});
        field.children?.forEach(child => {
          const childControl = this.createFieldControl(child);
          (control as FormGroup).addControl(child.id, childControl);
        });
        break;

      default:
        const initialValue = field.default ?? this.getDefaultValueForType(field.type);
        const isDisabled = field.disabled || field.readOnly;
        if (isDisabled) {
          control = this.fb.control(
            { value: initialValue, disabled: true },
            { validators: this.createValidators(field) }
          );
        } else {
          control = this.fb.control(
            initialValue,
            { validators: this.createValidators(field) }
          );
        }
        break;
    }

    return control;
  }

  /**
   * Gets default value for field type
   */
  private getDefaultValueForType(type: FieldType): string | number | boolean | null {
    switch (type) {
      case 'number':
        return 0;
      case 'checkbox':
        return false;
      case 'select':
      case 'radio':
        return null;
      case 'date':
        return null;
      case 'file':
        return null;
      default:
        return '';
    }
  }

  /**
   * Creates validators for a field
   */
  private createValidators(field: FormField): any[] {
    const validators: any[] = [];

    field.validators?.forEach(validator => {
      switch (validator.name) {
        case 'required':
          validators.push(Validators.required);
          break;
        case 'min':
          if (typeof validator.args === 'number') {
            validators.push(Validators.min(validator.args));
          }
          break;
        case 'max':
          if (typeof validator.args === 'number') {
            validators.push(Validators.max(validator.args));
          }
          break;
        case 'minlength':
          if (typeof validator.args === 'number') {
            validators.push(Validators.minLength(validator.args));
          }
          break;
        case 'maxlength':
          if (typeof validator.args === 'number') {
            validators.push(Validators.maxLength(validator.args));
          }
          break;
        case 'pattern':
          if (typeof validator.args === 'string' || validator.args instanceof RegExp) {
            validators.push(Validators.pattern(validator.args));
          }
          break;
        case 'email':
          validators.push(Validators.email);
          break;
      }
    });

    return validators;
  }

  /**
   * Sets up conditional logic for form
   */
  private setupConditionalLogic(
    form: FormGroup,
    schema: FormSchema,
    config: DynamicFormConfig
  ): void {
    // Track all conditional rules
    const conditionalFields: { [key: string]: FormField } = {};
    const conditionalSections: { [key: string]: FormSection } = {};

    // Collect all fields with conditional rules
    schema.sections.forEach(section => {
      if (section.visibleWhen) {
        conditionalSections[section.id] = section;
      }

      section.fields.forEach(field => {
        if (field.visibleWhen) {
          conditionalFields[field.id] = field;
        }
        this.collectNestedConditionalFields(field, conditionalFields);
      });
    });

    // Set up subscriptions for conditional logic
    Object.keys(conditionalFields).forEach(fieldId => {
      const field = conditionalFields[fieldId];
      this.setupFieldConditionalLogic(form, field, config);
    });

    Object.keys(conditionalSections).forEach(sectionId => {
      const section = conditionalSections[sectionId];
      this.setupSectionConditionalLogic(form, section, config);
    });
  }

  /**
   * Collects nested conditional fields (for group fields)
   */
  private collectNestedConditionalFields(
    field: FormField,
    conditionalFields: { [key: string]: FormField }
  ): void {
    if (field.children) {
      field.children.forEach(child => {
        if (child.visibleWhen) {
          conditionalFields[child.id] = child;
        }
        this.collectNestedConditionalFields(child, conditionalFields);
      });
    }
  }

  /**
   * Sets up conditional logic for a field
   */
  private setupFieldConditionalLogic(
    form: FormGroup,
    field: FormField,
    config: DynamicFormConfig
  ): void {
    if (!field.visibleWhen || field.visibleWhen.length === 0) return;

    // Get all controlling fields
    const controllingFields = field.visibleWhen.map(rule => rule.fieldId);
    const observables = controllingFields.map(fieldId => {
      const control = this.findControl(form, fieldId);
      return control ? control.valueChanges.pipe(startWith(control.value)) : null;
    }).filter(obs => obs !== null);

    if (observables.length === 0) return;

    // Combine all controlling field values and evaluate visibility
    combineLatest(observables)
      .pipe(
        debounceTime(config.validation?.debounceTime || 300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        const isVisible = this.evaluateConditionalRules(form, field.visibleWhen!);
        const fieldControl = this.findControl(form, field.id);

        if (fieldControl) {
          if (isVisible) {
            this.showField(fieldControl, field);
          } else {
            this.hideField(fieldControl, field);
          }
        }
      });
  }

  /**
   * Sets up conditional logic for a section
   */
  private setupSectionConditionalLogic(
    form: FormGroup,
    section: FormSection,
    config: DynamicFormConfig
  ): void {
    if (!section.visibleWhen || section.visibleWhen.length === 0) return;

    const controllingFields = section.visibleWhen.map(rule => rule.fieldId);
    const observables = controllingFields.map(fieldId => {
      const control = this.findControl(form, fieldId);
      return control ? control.valueChanges.pipe(startWith(control.value)) : null;
    }).filter(obs => obs !== null);

    if (observables.length === 0) return;

    combineLatest(observables)
      .pipe(
        debounceTime(config.validation?.debounceTime || 300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        const isVisible = this.evaluateConditionalRules(form, section.visibleWhen!);
        const sectionControl = form.get(section.id);

        if (sectionControl) {
          if (isVisible) {
            this.showSection(sectionControl, section);
          } else {
            this.hideSection(sectionControl, section);
          }
        }
      });
  }

  /**
   * Evaluates conditional rules
   */
  private evaluateConditionalRules(form: FormGroup, rules: ConditionalRule[]): boolean {
    return rules.every(rule => {
      const control = this.findControl(form, rule.fieldId);
      if (!control) return false;

      const fieldValue = control.value;
      return this.evaluateCondition(fieldValue, rule.operator, rule.value);
    });
  }

  /**
   * Evaluates a single condition
   */
  private evaluateCondition(fieldValue: any, operator: ConditionalOperator, ruleValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === ruleValue;
      case 'notEquals':
        return fieldValue !== ruleValue;
      case 'contains':
        return fieldValue && fieldValue.toString().includes(ruleValue);
      case 'notContains':
        return !fieldValue || !fieldValue.toString().includes(ruleValue);
      case 'greaterThan':
        return Number(fieldValue) > Number(ruleValue);
      case 'lessThan':
        return Number(fieldValue) < Number(ruleValue);
      case 'isEmpty':
        return !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0);
      case 'isNotEmpty':
        return fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0);
      default:
        return false;
    }
  }

  /**
   * Finds a control by field ID (supports nested fields)
   */
  private findControl(form: FormGroup, fieldId: string): AbstractControl | null {
    // Handle nested field IDs (e.g., "section.field")
    const parts = fieldId.split('.');
    let control: AbstractControl | null = form;

    for (const part of parts) {
      if (control instanceof FormGroup) {
        control = control.get(part);
      } else if (control instanceof FormArray) {
        // For arrays, we might need to handle differently based on requirements
        control = null;
        break;
      } else {
        control = null;
        break;
      }
    }

    return control;
  }

  /**
   * Shows a field (enables and makes visible)
   */
  private showField(control: AbstractControl, field: FormField): void {
    if (field.disabled) return; // Don't enable if originally disabled
    
    control.enable({ emitEvent: false });
    // Additional UI visibility logic would be handled by components
  }

  /**
   * Hides a field (disables and clears value)
   */
  private hideField(control: AbstractControl, field: FormField): void {
    control.disable({ emitEvent: false });
    control.setValue(this.getDefaultValueForType(field.type), { emitEvent: false });
    // Additional UI visibility logic would be handled by components
  }

  /**
   * Shows a section
   */
  private showSection(control: AbstractControl, section: FormSection): void {
    if (control instanceof FormGroup) {
      control.enable({ emitEvent: false });
    }
  }

  /**
   * Hides a section
   */
  private hideSection(control: AbstractControl, section: FormSection): void {
    if (control instanceof FormGroup) {
      control.disable({ emitEvent: false });
      // Reset all fields in section
      Object.keys(control.controls).forEach(key => {
        const fieldControl = control.get(key);
        if (fieldControl) {
          const field = section.fields.find(f => f.id === key);
          if (field) {
            fieldControl.setValue(this.getDefaultValueForType(field.type), { emitEvent: false });
          }
        }
      });
    }
  }

  /**
   * Sets up form validation
   */
  private setupValidation(
    form: FormGroup,
    schema: FormSchema,
    config: DynamicFormConfig
  ): void {
    if (config.validation?.mode === 'onChange') {
      form.valueChanges
        .pipe(debounceTime(config.validation?.debounceTime || 300))
        .subscribe(() => {
          // Custom validation logic can be added here
        });
    }
  }

  /**
   * Adds a repeatable section instance
   */
  addRepeatableSection(form: FormGroup, sectionId: string, section: FormSection): void {
    const formArray = form.get(sectionId) as FormArray;
    if (formArray && section.repeatable) {
      if (!section.maxRepeats || formArray.length < section.maxRepeats) {
        formArray.push(this.createSectionGroup(section));
      }
    }
  }

  /**
   * Removes a repeatable section instance
   */
  removeRepeatableSection(form: FormGroup, sectionId: string, index: number, section: FormSection): void {
    const formArray = form.get(sectionId) as FormArray;
    if (formArray && section.repeatable) {
      if (!section.minRepeats || formArray.length > section.minRepeats) {
        formArray.removeAt(index);
      }
    }
  }

  /**
   * Converts form value to submission data format
   */
  convertToSubmissionData(form: FormGroup): FormSubmissionData {
    const formValue = form.value;
    const submissionData: FormSubmissionData = {};

    Object.keys(formValue).forEach(sectionId => {
      submissionData[sectionId] = formValue[sectionId];
    });

    return submissionData;
  }

  /**
   * Populates form with existing data
   */
  populateForm(form: FormGroup, data: FormSubmissionData): void {
    Object.keys(data).forEach(sectionId => {
      const control = form.get(sectionId);
      if (control) {
        control.patchValue(data[sectionId], { emitEvent: false });
      }
    });
  }

  /**
   * Gets validation errors from form
   */
  getValidationErrors(form: FormGroup, schema: FormSchema): FormValidationError[] {
    const errors: FormValidationError[] = [];

    schema.sections.forEach(section => {
      const sectionControl = form.get(section.id);
      if (sectionControl) {
        this.collectSectionErrors(sectionControl, section, errors);
      }
    });

    return errors;
  }

  /**
   * Collects errors from a section
   */
  private collectSectionErrors(
    sectionControl: AbstractControl,
    section: FormSection,
    errors: FormValidationError[]
  ): void {
    if (sectionControl instanceof FormArray) {
      sectionControl.controls.forEach((control, index) => {
        if (control instanceof FormGroup) {
          this.collectGroupErrors(control, section, errors, index);
        }
      });
    } else if (sectionControl instanceof FormGroup) {
      this.collectGroupErrors(sectionControl, section, errors);
    }
  }

  /**
   * Collects errors from a form group
   */
  private collectGroupErrors(
    group: FormGroup,
    section: FormSection,
    errors: FormValidationError[],
    arrayIndex?: number
  ): void {
    section.fields.forEach(field => {
      const control = group.get(field.id);
      if (control && control.errors) {
        Object.keys(control.errors).forEach(errorKey => {
          const validator = field.validators?.find(v => v.name === errorKey);
          errors.push({
            fieldId: field.id,
            sectionId: section.id,
            fieldPath: `${section.id}.${field.id}`,
            message: validator?.message || this.getDefaultErrorMessage(errorKey, field),
            code: errorKey,
            severity: 'error',
            timestamp: new Date()
          });
        });
      }
    });
  }

  /**
   * Gets default error message for validation error
   */
  private getDefaultErrorMessage(errorKey: string, field: FormField): string {
    switch (errorKey) {
      case 'required':
        return `${field.label} is required`;
      case 'min':
        return `${field.label} must be greater than minimum value`;
      case 'max':
        return `${field.label} must be less than maximum value`;
      case 'minlength':
        return `${field.label} must be at least minimum length`;
      case 'maxlength':
        return `${field.label} must not exceed maximum length`;
      case 'pattern':
        return `${field.label} format is invalid`;
      case 'email':
        return `${field.label} must be a valid email address`;
      default:
        return `${field.label} is invalid`;
    }
  }
}
