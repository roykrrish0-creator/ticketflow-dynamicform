import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { FormSectionComponent } from '../../components/form-section/form-section.component';
import { TicketSummaryComponent } from '../../components/ticket-summary/ticket-summary.component';

import { DynamicFormService } from '../../../../shared/services/dynamic-form.service';
import { HistoryService } from '../../../../shared/services/history.service';
import { MockDataService } from '../../../../shared/services/mock-data.service';
import { 
  FormSchema, 
  Ticket, 
  TicketStatus, 
  FormSubmissionData, 
  AsyncOperation,
  Comment
} from '../../../../shared/models';
import { HistoryItem } from '../../../../shared/models/history.interface';

@Component({
    selector: 'app-ticket-detail',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTabsModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatChipsModule,
        MatTooltipModule,
        MatMenuModule,
        MatDialogModule,
        FormSectionComponent,
        TicketSummaryComponent
    ],
    templateUrl: './ticket-detail.component.html',
    styleUrls: ['./ticket-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private dynamicFormService = inject(DynamicFormService);
  private historyService = inject(HistoryService);
  private mockDataService = inject(MockDataService); // TODO: Replace with actual API services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('formContainer', { static: false }) formContainer!: ElementRef;
  @ViewChild('summaryContainer', { static: false }) summaryContainer!: ElementRef;
  @ViewChild('tabsContainer', { static: false }) tabsContainer!: ElementRef;

  // Component state
  ticketId!: string;
  
  // Async operations
  ticketOperation: AsyncOperation<Ticket> = { isLoading: true };
  schemaOperation: AsyncOperation<FormSchema> = { isLoading: true };
  saveOperation: AsyncOperation<any> = { isLoading: false };
  
  // Form state
  dynamicForm?: FormGroup;
  formSchema?: FormSchema;
  ticket?: Ticket;
  
  // UI state
  selectedTabIndex = 0;
  isMobileView = false;
  isTabletView = false;
  showSummaryDrawer = false;
  isSummarySticky = true;
  isEditMode = false;
  showCancelConfirmation = false;
  
  // Configuration
  autoSaveEnabled = true;
  autoSaveInterval = 5000;
  
  // Computed properties for header
  get canSave(): boolean {
    return !!(this.dynamicForm?.valid && this.dynamicForm?.dirty);
  }
  
  get isSaving(): boolean {
    return this.saveOperation.isLoading;
  }
  
  // Draft saving state
  isDraftSaving = false;
  
  // Comments state - now loaded from MockDataService
  // TODO: Replace with actual CommentService
  newComment = '';
  mockComments: Comment[] = [];
  
  // History state
  historyItems = this.historyService.getHistorySignal();
  
  // Computed property for history count
  get historyCount(): number {
    return this.historyItems().length;
  }
  
  ngOnInit(): void {
    this.initializeComponent();
    this.setupResponsiveHandling();
    this.setupStickyBehavior();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize component data and setup
   */
  private initializeComponent(): void {
    // Get ticket ID from route
    this.ticketId = this.route.snapshot.params['id'];
    
    if (!this.ticketId) {
      this.showError('Invalid ticket ID');
      this.router.navigate(['/tickets']);
      return;
    }

    // Load ticket and form schema
    this.loadTicketData();
  }

  /**
   * Load ticket data and form schema using centralized MockDataService
   * TODO: Replace MockDataService calls with actual API service calls
   */
  async loadTicketData(): Promise<void> {
    try {
      // Load ticket data using MockDataService
      // TODO: Replace with actual TicketService.getTicketById(ticketId)
      this.mockDataService.getTicketById(this.ticketId).subscribe({
        next: (ticket) => {
          this.ticket = ticket;
          this.ticketOperation = { isLoading: false, data: ticket };
          
          // Populate form with existing data after ticket is loaded
          if (this.dynamicForm && ticket.formData) {
            this.dynamicFormService.populateForm(this.dynamicForm, ticket.formData);
          }
          
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.ticketOperation = { 
            isLoading: false, 
            error: {
              id: 'error_001',
              type: 'network',
              code: 'LOAD_TICKET_FAILED',
              message: 'Failed to load ticket data',
              timestamp: new Date()
            }
          };
          this.handleError('Failed to load ticket data', error);
          this.cdr.detectChanges();
        }
      });
      
      // Load form schema using MockDataService
      // TODO: Replace with actual FormSchemaService.getFormSchema(schemaId)
      this.mockDataService.getFormSchema('schema_001').subscribe({
        next: (schema) => {
          this.formSchema = schema;
          this.schemaOperation = { isLoading: false, data: schema };
          
          // Create dynamic form after schema is loaded
          this.createDynamicForm();
          
          // Setup auto-save if enabled
          if (this.autoSaveEnabled) {
            this.setupAutoSave();
          }
          
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.schemaOperation = { 
            isLoading: false, 
            error: {
              id: 'error_002',
              type: 'network',
              code: 'LOAD_SCHEMA_FAILED',
              message: 'Failed to load form schema',
              timestamp: new Date()
            }
          };
          this.handleError('Failed to load form schema', error);
          this.cdr.detectChanges();
        }
      });
      
      // Load comments using MockDataService
      // TODO: Replace with actual CommentService.getTicketComments(ticketId)
      this.mockDataService.getTicketComments(this.ticketId).subscribe({
        next: (comments) => {
          this.mockComments = comments;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load comments:', error);
        }
      });
      
    } catch (error) {
      this.handleError('Failed to initialize data loading', error);
    }
  }

  /**
   * Create dynamic form from schema
   */
  private createDynamicForm(): void {
    if (!this.formSchema) return;
    
    this.dynamicForm = this.dynamicFormService.createFormFromSchema(
      this.formSchema,
      {
        autoSave: {
          enabled: this.autoSaveEnabled,
          interval: this.autoSaveInterval,
          showIndicator: true,
          onlyIfValid: false
        },
        conditionalLogic: {
          enabled: true,
          animateTransitions: false,
          evaluationMode: 'lazy',
          debugMode: false
        },
        validation: {
          mode: 'onChange',
          debounceTime: 300,
          showInlineErrors: true,
          showSummary: true,
          scrollToFirstError: true,
          highlightInvalidFields: true
        }
      }
    );
  }

  /**
   * Setup auto-save functionality
   */
  private setupAutoSave(): void {
    if (!this.dynamicForm) return;
    
    this.dynamicForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(this.autoSaveInterval),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(value => {
        if (this.dynamicForm?.dirty && this.dynamicForm?.valid) {
          this.saveDraft();
        }
      });
  }

  /**
   * Setup responsive breakpoint handling
   */
  private setupResponsiveHandling(): void {
    // Use ResizeObserver or window resize events to handle responsive layout
    const handleResize = () => {
      const width = window.innerWidth;
      const oldIsMobile = this.isMobileView;
      const oldIsTablet = this.isTabletView;
      
      this.isMobileView = width <= 767;
      this.isTabletView = width >= 768 && width <= 1279;
      
      // Adjust layout based on screen size
      if (this.isMobileView) {
        this.showSummaryDrawer = false;
      }
      
      // Trigger change detection if responsive state changed
      if (oldIsMobile !== this.isMobileView || oldIsTablet !== this.isTabletView) {
        this.cdr.detectChanges();
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    // Cleanup on destroy
    this.destroy$.subscribe(() => {
      window.removeEventListener('resize', handleResize);
    });
  }

  /**
   * Handle form submission using MockDataService
   * TODO: Replace with actual TicketService.saveTicket(ticketId, formData)
   */
  async onSubmit(): Promise<void> {
    if (!this.dynamicForm || !this.formSchema) return;

    if (this.dynamicForm.invalid) {
      const errors = this.dynamicFormService.getValidationErrors(this.dynamicForm, this.formSchema);
      this.showValidationErrors(errors);
      return;
    }

    try {
      this.saveOperation = { isLoading: true };
      
      const formData = this.dynamicFormService.convertToSubmissionData(this.dynamicForm);
      
      // Use MockDataService to save ticket
      this.mockDataService.saveTicket(this.ticketId, formData).subscribe({
        next: (updatedTicket) => {
          this.ticket = updatedTicket;
          this.saveOperation = { isLoading: false, data: updatedTicket };
          this.dynamicForm!.markAsPristine();
          this.showSuccess('Ticket saved successfully');
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.saveOperation = { 
            isLoading: false, 
            error: {
              id: 'error_003',
              type: 'network',
              code: 'SAVE_TICKET_FAILED',
              message: 'Failed to save ticket',
              timestamp: new Date()
            }
          };
          this.handleError('Failed to save ticket', error);
          this.cdr.detectChanges();
        }
      });
      
    } catch (error) {
      this.saveOperation = { 
        isLoading: false, 
        error: {
          id: 'error_003',
          type: 'network',
          code: 'SAVE_TICKET_FAILED',
          message: 'Failed to save ticket',
          timestamp: new Date()
        }
      };
      this.handleError('Failed to save ticket', error);
    }
  }

  /**
   * Save as draft using MockDataService
   * TODO: Replace with actual TicketService.saveDraft(ticketId, formData)
   */
  async saveDraft(): Promise<void> {
    if (!this.dynamicForm) return;

    try {
      this.isDraftSaving = true;
      this.cdr.detectChanges();
      
      const formData = this.dynamicFormService.convertToSubmissionData(this.dynamicForm);
      
      // Use MockDataService to save draft
      this.mockDataService.saveDraft(this.ticketId, formData).subscribe({
        next: () => {
          this.isDraftSaving = false;
          this.dynamicForm!.markAsPristine();
          this.showInfo('Draft saved');
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isDraftSaving = false;
          console.error('Failed to save draft:', error);
          this.cdr.detectChanges();
        }
      });
      
    } catch (error) {
      this.isDraftSaving = false;
      console.error('Failed to save draft:', error);
      this.cdr.detectChanges();
    }
  }

  /**
   * Cancel/reset form
   */
  onCancel(): void {
    if (this.dynamicForm?.dirty) {
      // TODO: Show confirmation dialog
      const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }

    if (this.dynamicForm && this.ticket?.formData) {
      this.dynamicFormService.populateForm(this.dynamicForm, this.ticket.formData);
      this.dynamicForm.markAsPristine();
    }
  }

  /**
   * Handle tab selection change
   */
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    
    // Load tab data lazily
    if (index === 0) {
      // Comments tab - load comments if not loaded
      console.log('Comments tab selected');
    } else if (index === 1) {
      // History tab - load history if not loaded
      console.log('History tab selected');
    }
    
    // Trigger change detection
    this.cdr.detectChanges();
  }

  /**
   * Toggle summary drawer on mobile
   */
  toggleSummaryDrawer(): void {
    this.showSummaryDrawer = !this.showSummaryDrawer;
  }

  /**
   * Add repeatable section
   */
  addRepeatableSection(sectionId: string): void {
    if (!this.dynamicForm || !this.formSchema) return;
    
    const section = this.formSchema.sections.find(s => s.id === sectionId);
    if (section?.repeatable) {
      this.dynamicFormService.addRepeatableSection(this.dynamicForm, sectionId, section);
    }
  }

  /**
   * Remove repeatable section
   */
  removeRepeatableSection(sectionId: string, index: number): void {
    if (!this.dynamicForm || !this.formSchema) return;
    
    const section = this.formSchema.sections.find(s => s.id === sectionId);
    if (section?.repeatable) {
      // TODO: Show confirmation dialog
      const confirmed = confirm('Are you sure you want to remove this section?');
      if (confirmed) {
        this.dynamicFormService.removeRepeatableSection(this.dynamicForm, sectionId, index, section);
      }
    }
  }

  /**
   * Show validation errors
   */
  private showValidationErrors(errors: any[]): void {
    const message = `Form contains ${errors.length} validation error(s)`;
    this.showError(message);
  }

  /**
   * Error handler
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.showError(message);
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show info message
   */
  private showInfo(message: string): void {
    this.snackBar.open(message, '', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Simulate async operation (replace with actual API calls)
   */
  private simulateAsyncOperation(delay: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
  }



  /**
   * Add a new comment using MockDataService
   * TODO: Replace with actual CommentService.addComment(ticketId, commentText, isInternal)
   */
  addComment(): void {
    if (!this.newComment?.trim()) return;

    const commentText = this.newComment.trim();
    
    // Use MockDataService to add comment
    this.mockDataService.addComment(this.ticketId, commentText, false).subscribe({
      next: (newComment) => {
        this.mockComments.unshift(newComment);
        
        // Add history entry for the comment
        this.addHistoryItem('Comment Added', newComment.author, `Comment: "${commentText}"`);    
        
        this.newComment = '';
        this.showSuccess('Comment added successfully');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to add comment:', error);
        this.showError('Failed to add comment');
      }
    });
  }

  /**
   * Add a new history item to the timeline
   */
  private addHistoryItem(action: string, actor: string, details?: string): void {
    this.historyService.addHistoryItem(this.ticketId, {
      action,
      actor,
      details
    }).subscribe({
      next: () => {
        // History is automatically updated via signal
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to add history item:', error);
      }
    });
  }

  /**
   * Get section FormGroup with proper type casting
   */
  getSectionFormGroup(sectionId: string): FormGroup {
    const control = this.dynamicForm?.get(sectionId);
    return control as FormGroup || new FormGroup({});
  }

  /**
   * Get section icon based on section content
   */
  getSectionIcon(sectionId: string): string {
    const sectionLower = sectionId.toLowerCase();
    
    if (sectionLower.includes('basic') || sectionLower.includes('general')) {
      return 'info';
    } else if (sectionLower.includes('employee') || sectionLower.includes('personal')) {
      return 'badge';
    } else if (sectionLower.includes('employment') || sectionLower.includes('work')) {
      return 'business_center';
    } else if (sectionLower.includes('contact')) {
      return 'contact_mail';
    } else if (sectionLower.includes('address')) {
      return 'place';
    }
    
    return 'article';
  }
  
  /**
   * Get CSS grid class for field layout
   */
  getFieldGridClass(field: any): string {
    if (field.type === 'textarea' || field.type === 'radio') {
      return 'full-width';
    }
    return 'half-width';
  }
  
  /**
   * Get validation message for field
   */
  getValidationMessage(field: any, errorType: string): string {
    const validator = field.validators?.find((v: any) => v.name === errorType);
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
   * Get history icon based on action
   */
  getHistoryIcon(action: string): string {
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('created')) {
      return 'add_circle_outline';
    } else if (actionLower.includes('assigned')) {
      return 'person_add_alt_1';
    } else if (actionLower.includes('status')) {
      return 'trending_up';
    } else if (actionLower.includes('upload') || actionLower.includes('document')) {
      return 'file_upload';
    } else if (actionLower.includes('comment')) {
      return 'chat_bubble';
    }
    
    return 'schedule';
  }

  /**
   * TrackBy function for sections
   */
  trackBySection(index: number, section: any): string {
    return section.id;
  }
  
  /**
   * TrackBy function for fields
   */
  trackByFieldId(index: number, field: any): string {
    return field.id;
  }

  /**
   * TrackBy function for options
   */
  trackByOptionValue(index: number, option: any): any {
    return option.value;
  }
  
  /**
   * TrackBy function for history items
   */
  trackByHistoryId(index: number, historyItem: any): number {
    return historyItem.id;
  }
  
  /**
   * Setup sticky summary behavior
   */
  private setupStickyBehavior(): void {
    // Only apply on desktop
    if (this.isMobileView) return;

    // Set up intersection observer for when tabs come into view
    const handleScroll = () => {
      if (!this.tabsContainer || this.isMobileView) return;

      const tabsElement = this.tabsContainer.nativeElement;
      const summaryElement = this.summaryContainer?.nativeElement;

      if (!tabsElement || !summaryElement) return;

      const tabsRect = tabsElement.getBoundingClientRect();
      const summaryRect = summaryElement.getBoundingClientRect();

      // When the tabs section starts scrolling up past the viewport,
      // allow the summary to scroll out of view
      if (tabsRect.top <= 100) {
        this.isSummarySticky = false;
      } else {
        this.isSummarySticky = true;
      }

      this.cdr.detectChanges();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup on destroy
    this.destroy$.subscribe(() => {
      window.removeEventListener('scroll', handleScroll);
    });
  }
  
  /**
   * Header action handlers
   */
  handleReassign(): void {
    // TODO: Implement reassign functionality
    console.log('Reassign ticket');
  }

  /**
   * Enter edit mode
   */
  enterEditMode(): void {
    this.isEditMode = true;
    this.cdr.detectChanges();
  }

  /**
   * Exit edit mode and return to read-only
   */
  exitEditMode(): void {
    this.isEditMode = false;
    this.cdr.detectChanges();
  }

  /**
   * Handle save changes action
   */
  async handleSaveChanges(): Promise<void> {
    await this.onSubmit();
    if (!this.saveOperation.error) {
      this.exitEditMode();
    }
  }

  /**
   * Handle cancel action from dropdown
   */
  handleCancel(): void {
    if (this.dynamicForm?.dirty) {
      this.showCancelConfirmation = true;
      this.cdr.detectChanges();
    } else {
      this.exitEditMode();
    }
  }

  /**
   * Confirm discard changes
   */
  confirmDiscardChanges(): void {
    if (this.dynamicForm && this.ticket?.formData) {
      this.dynamicFormService.populateForm(this.dynamicForm, this.ticket.formData);
      this.dynamicForm.markAsPristine();
    }
    this.showCancelConfirmation = false;
    this.exitEditMode();
  }

  /**
   * Cancel discard changes (go back to editing)
   */
  cancelDiscardChanges(): void {
    this.showCancelConfirmation = false;
    this.cdr.detectChanges();
  }
  
  
  /**
   * Get validation summary message
   */
  getValidationSummary(): string {
    if (!this.dynamicForm || this.dynamicForm.valid) {
      return '';
    }
    
    const errors = this.getFormErrors();
    const errorCount = errors.length;
    
    if (errorCount === 1) {
      return 'Please fix 1 validation error before saving';
    }
    
    return `Please fix ${errorCount} validation errors before saving`;
  }
  
  /**
   * Get screen reader status message
   */
  getScreenReaderStatus(): string {
    if (this.saveOperation.isLoading) {
      return 'Saving changes, please wait';
    }
    
    if (this.isDraftSaving) {
      return 'Saving draft, please wait';
    }
    
    if (this.dynamicForm?.invalid && this.dynamicForm?.touched) {
      return this.getValidationSummary();
    }
    
    return '';
  }
  
  /**
   * Get form validation errors
   */
  private getFormErrors(): any[] {
    const errors: any[] = [];
    
    if (!this.dynamicForm || !this.formSchema) {
      return errors;
    }
    
    this.formSchema.sections.forEach(section => {
      const sectionFormGroup = this.getSectionFormGroup(section.id);
      
      section.fields.forEach(field => {
        const fieldControl = sectionFormGroup.get(field.id);
        
        if (fieldControl && fieldControl.errors) {
          errors.push({
            sectionId: section.id,
            fieldId: field.id,
            fieldLabel: field.label,
            errors: fieldControl.errors
          });
        }
      });
    });
    
    return errors;
  }
  
  /**
   * Get select option label for display
   */
  getSelectOptionLabel(field: any, value: any): string {
    if (!value || !field.options) {
      return field.default || '-';
    }
    
    const option = field.options.find((opt: any) => opt.value === value);
    return option?.label || value || '-';
  }
  
  /**
   * Get radio option label for display
   */
  getRadioOptionLabel(field: any, value: any): string {
    if (!value || !field.options) {
      return field.default || '-';
    }
    
    const option = field.options.find((opt: any) => opt.value === value);
    return option?.label || value || '-';
  }
  
  /**
   * Format date for display
   */
  formatDate(dateValue: any): string {
    if (!dateValue) {
      return '-';
    }
    
    try {
      const date = new Date(dateValue);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateValue.toString();
    }
  }
  
  /**
   * Get initials from author name for comments
   */
  getCommentInitials(authorName: string): string {
    if (!authorName) return '?';
    const words = authorName.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0][0].toUpperCase();
  }
}
