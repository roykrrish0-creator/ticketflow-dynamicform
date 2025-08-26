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
import { TicketDetailHeaderComponent } from '../../components/ticket-detail-header/ticket-detail-header.component';
import { TicketSummaryComponent } from '../../components/ticket-summary/ticket-summary.component';

import { DynamicFormService } from '../../../../shared/services/dynamic-form.service';
import { 
  FormSchema, 
  Ticket, 
  TicketStatus, 
  FormSubmissionData, 
  AsyncOperation 
} from '../../../../shared/models';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
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
    TicketDetailHeaderComponent,
    TicketSummaryComponent
  ],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private dynamicFormService = inject(DynamicFormService);
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
  
  // Comments state
  newComment = '';
  mockComments = [
    {
      id: 1,
      author: 'Sarah Johnson',
      timestamp: '2 hours ago',
      text: "I've started the onboarding process for John Smith. All documentation has been prepared and sent to the new hire.",
      isInternal: false
    },
    {
      id: 2,
      author: 'Mike Chen',
      timestamp: '1 hour ago',
      text: "Thanks Sarah! I've scheduled the orientation session for tomorrow at 10 AM. The conference room is booked.",
      isInternal: true
    },
    {
      id: 3,
      author: 'John Smith',
      timestamp: '30 minutes ago',
      text: 'Looking forward to starting! I have a question about the parking arrangements.',
      isInternal: false
    }
  ];
  
  // History state
  mockHistory = [
    {
      id: 1,
      action: 'Ticket Created',
      actor: 'Jane Doe',
      timestamp: 'Jan 15, 2024, 10:00 AM',
      details: 'Employee onboarding request submitted for John Smith'
    },
    {
      id: 2,
      action: 'Assigned to Mike Chen',
      actor: 'System',
      timestamp: 'Jan 15, 2024, 10:05 AM',
      details: 'Ticket automatically assigned based on workload and expertise'
    },
    {
      id: 3,
      action: 'Status changed to On Track',
      actor: 'Mike Chen',
      timestamp: 'Jan 16, 2024, 9:30 AM',
      details: 'Initial review completed, proceeding with onboarding checklist'
    },
    {
      id: 4,
      action: 'Documents Uploaded',
      actor: 'Sarah Johnson',
      timestamp: 'Jan 16, 2024, 2:15 PM',
      details: 'Employment contract and handbook uploaded to employee portal'
    }
  ];
  
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
   * Load ticket data and form schema
   */
  async loadTicketData(): Promise<void> {
    try {
      // TODO: Replace with actual API service calls
      // For now, using mock data to demonstrate the component structure
      
      // Simulate API calls
      await this.simulateAsyncOperation(800);
      
      // Mock ticket data
      this.ticket = this.createMockTicket();
      this.ticketOperation = { isLoading: false, data: this.ticket };
      
      // Mock form schema
      this.formSchema = this.createMockFormSchema();
      this.schemaOperation = { isLoading: false, data: this.formSchema };
      
      // Create dynamic form
      this.createDynamicForm();
      
      // Populate form with existing data
      if (this.dynamicForm && this.ticket.formData) {
        this.dynamicFormService.populateForm(this.dynamicForm, this.ticket.formData);
      }
      
      // Setup auto-save if enabled
      if (this.autoSaveEnabled) {
        this.setupAutoSave();
      }
      
      // Trigger change detection
      this.cdr.detectChanges();
      
    } catch (error) {
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
      this.handleError('Failed to load ticket data', error);
      this.cdr.detectChanges();
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
   * Handle form submission
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
      
      // TODO: Replace with actual API service call
      await this.simulateAsyncOperation(1000);
      
      this.saveOperation = { isLoading: false };
      this.dynamicForm.markAsPristine();
      this.showSuccess('Ticket saved successfully');
      
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
   * Save as draft
   */
  async saveDraft(): Promise<void> {
    if (!this.dynamicForm) return;

    try {
      this.isDraftSaving = true;
      this.cdr.detectChanges();
      
      const formData = this.dynamicFormService.convertToSubmissionData(this.dynamicForm);
      
      // TODO: Replace with actual API service call
      await this.simulateAsyncOperation(500);
      
      this.isDraftSaving = false;
      this.dynamicForm.markAsPristine();
      this.showInfo('Draft saved');
      
    } catch (error) {
      this.isDraftSaving = false;
      console.error('Failed to save draft:', error);
    }

    this.cdr.detectChanges();
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
    } else if (index === 1) {
      // History tab - load history if not loaded
    }
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
   * Create mock ticket data (replace with actual API service)
   */
  private createMockTicket(): Ticket {
    const now = new Date();
    const createdDate = new Date('2024-01-15T10:30:00Z');
    
    // Create mock TicketType
    const mockTicketType = {
      id: 'tt_support_001',
      createdAt: createdDate,
      createdBy: 'system',
      updatedAt: createdDate,
      version: 1,
      name: 'employee_onboarding',
      description: 'Employee onboarding process',
      icon: 'person_add',
      color: '#4CAF50',
      isActive: true,
      formSchemaId: 'schema_001',
      workflow: {
        initialStatus: 'open' as TicketStatus,
        allowedTransitions: [
          {
            from: 'open' as TicketStatus,
            to: ['in_progress' as TicketStatus, 'closed' as TicketStatus],
            conditions: {},
            requiredPermissions: ['ticket.update']
          }
        ]
      }
    };

    // Create mock users
    const mockAssignedUser = {
      id: 'user_002',
      createdAt: createdDate,
      createdBy: 'system',
      updatedAt: createdDate,
      version: 1,
      username: 'jane.smith',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      displayName: 'Jane Smith',
      name: 'Jane Smith',
      avatar: 'https://via.placeholder.com/40',
      roles: ['agent'],
      department: 'HR',
      isActive: true,
      preferences: {
        notifications: true,
        emailUpdates: true,
        theme: 'light' as const,
        language: 'en'
      }
    };

    // Create mock tags
    const mockTags = [
      {
        id: 'tag_001',
        createdAt: createdDate,
        createdBy: 'system',
        updatedAt: createdDate,
        version: 1,
        name: 'urgent',
        slug: 'urgent',
        color: '#ff6b6b',
        backgroundColor: '#ffebee',
        textColor: '#d32f2f',
        description: 'Urgent priority ticket',
        isSystemTag: true,
        sortOrder: 1,
        usageCount: 45
      },
      {
        id: 'tag_002',
        createdAt: createdDate,
        createdBy: 'system',
        updatedAt: createdDate,
        version: 1,
        name: 'customer-facing',
        slug: 'customer-facing',
        color: '#4ecdc4',
        backgroundColor: '#e0f7fa',
        textColor: '#00695c',
        description: 'Customer facing ticket',
        isSystemTag: false,
        sortOrder: 2,
        usageCount: 23
      }
    ];

    return {
      // Base entity fields
      id: this.ticketId,
      createdAt: createdDate,
      createdBy: 'user_001', // User ID reference
      updatedAt: now,
      updatedBy: 'user_002',
      version: 1,
      isDeleted: false,
      
      // Ticket fields
      ticketNumber: 'TICK-2024-001',
      title: 'Employee Onboarding - John Smith',
      description: 'Complete onboarding process for new hire John Smith',
      status: 'open',
      statusHistory: [
        {
          status: 'open',
          changedAt: createdDate,
          changedBy: 'user_001',
          reason: 'Initial ticket creation'
        }
      ],
      
      priority: 'medium',
      priorityHistory: [
        {
          priority: 'medium',
          changedAt: createdDate,
          changedBy: 'user_001',
          reason: 'Initial priority assignment'
        }
      ],
      
      type: mockTicketType,
      category: 'hr',
      subcategory: 'onboarding',
      
      // People and assignment
      createdByUser: {
        id: 'user_001',
        createdAt: createdDate,
        createdBy: 'system',
        updatedAt: createdDate,
        version: 1,
        username: 'john.doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'John Doe',
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/40',
        roles: ['user'],
        department: 'Engineering',
        isActive: true,
        preferences: {
          notifications: true,
          emailUpdates: true,
          theme: 'light' as const,
          language: 'en'
        }
      },
      assignedTo: mockAssignedUser,
      assignedToId: mockAssignedUser.id,
      assignmentHistory: [
        {
          assignedTo: mockAssignedUser.id,
          assignedAt: createdDate,
          assignedBy: 'user_001',
          reason: 'Auto-assigned based on workload'
        }
      ],
      
      watchers: ['user_003', 'user_004'],
      
      // Timestamps
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      estimatedResolutionTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      
      // SLA tracking
      slaHistory: [
        {
          event: 'started',
          timestamp: createdDate,
          reason: 'Ticket created and SLA timer started'
        }
      ],
      
      // Organization and relationships
      tags: mockTags,
      childTicketIds: [],
      relatedTicketIds: [],
      duplicates: [],
      
      // Form data
      formData: {
        basic_information: {
          ticket_id: '#1234',
          process_type: 'employee_onboarding',
          client: 'Acme Corp',
          priority_level: 'medium',
          due_date: '2024-02-15'
        },
        employee_details: {
          full_name: 'John Smith',
          employee_id: 'EMP-2024-001',
          email_address: 'john.smith@acmecorp.com',
          phone_number: '+1 (555) 123-4567',
          date_of_birth: '1990-05-15',
          emergency_contact: 'Jane Smith',
          emergency_phone: '+1 (555) 987-6543'
        },
        employment_information: {
          start_date: '2024-01-22',
          department: 'engineering',
          position_title: 'Senior Software Engineer',
          reporting_manager: 'Sarah Johnson',
          work_location: 'new_york',
          employment_type: 'full-time',
          salary_range: '100k-120k',
          benefits_eligible: true,
          additional_notes: 'New hire with 5+ years experience in React and Node.js. Will be working on the core platform team.'
        },
        equipment_access: {
          laptop_type: 'macbook',
          monitor_needed: true,
          phone_needed: false,
          access_systems: 'GitHub, Jira, Confluence, Slack, Google Workspace, AWS Console',
          special_requirements: ''
        }
      },
      formSchemaId: 'schema_001',
      formSchemaVersion: '1.0.0',
      
      // Metrics
      metrics: {
        commentCount: 3,
        attachmentCount: 2,
        viewCount: 15,
        editCount: 2,
        reopenCount: 0,
        timeSpentMinutes: 120
      },
      
      // Source and location
      source: {
        channel: 'web',
        origin: 'https://portal.acmecorp.com',
        userAgent: 'Mozilla/5.0...',
        ipAddress: '192.168.1.100'
      },
      
      location: {
        country: 'United States',
        region: 'New York',
        city: 'New York',
        timezone: 'America/New_York'
      },
      
      // Flags
      flags: {
        isLocked: false,
        isArchived: false,
        isFlagged: false,
        isUrgent: false,
        isEscalated: false,
        isOverdue: false,
        hasUnreadComments: true,
        requiresAttention: false
      },
      
      // Custom fields
      customFields: {
        client: 'Acme Corp',
        cost_center: 'CC-001',
        project_code: 'PROJ-2024-001'
      },
      
      labels: ['new-hire', 'high-priority', 'onboarding']
    };
  }

  /**
   * Create comprehensive mock form schema (replace with actual API service)
   */
  private createMockFormSchema(): FormSchema {
    return {
      id: 'employee_onboarding_v1',
      title: 'Employee Onboarding - John Smith',
      description: 'Complete employee onboarding form',
      sections: [
        {
          id: 'basic_information',
          title: 'Basic Information',
          collapsible: true,
          collapsed: false,
          repeatable: false,
          fields: [
            {
              id: 'ticket_id',
              label: 'Ticket ID',
              type: 'text',
              default: '#1234',
              readOnly: true,
              validators: []
            },
            {
              id: 'process_type',
              label: 'Process Type',
              type: 'select',
              default: 'employee_onboarding',
              options: [
                { value: 'employee_onboarding', label: 'Employee Onboarding' },
                { value: 'employee_offboarding', label: 'Employee Offboarding' },
                { value: 'role_change', label: 'Role Change' },
                { value: 'department_transfer', label: 'Department Transfer' }
              ],
              validators: [{ name: 'required', message: 'Process type is required' }]
            },
            {
              id: 'client',
              label: 'Client/Organization',
              type: 'text',
              default: 'Acme Corp',
              validators: [{ name: 'required', message: 'Client name is required' }]
            },
            {
              id: 'priority_level',
              label: 'Priority Level',
              type: 'radio',
              default: 'medium',
              options: [
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' }
              ],
              validators: [{ name: 'required', message: 'Priority level is required' }]
            },
            {
              id: 'due_date',
              label: 'Due Date',
              type: 'date',
              default: '2024-02-15',
              validators: [{ name: 'required', message: 'Due date is required' }]
            }
          ]
        },
        {
          id: 'employee_details',
          title: 'Employee Details',
          collapsible: true,
          collapsed: true,
          repeatable: false,
          fields: [
            {
              id: 'full_name',
              label: 'Full Name',
              type: 'text',
              default: 'John Smith',
              placeholder: 'Enter full name',
              validators: [
                { name: 'required', message: 'Full name is required' },
                { name: 'minlength', message: 'Name must be at least 2 characters', value: 2 }
              ]
            },
            {
              id: 'employee_id',
              label: 'Employee ID',
              type: 'text',
              default: 'EMP-2024-001',
              placeholder: 'e.g., EMP-2024-001',
              validators: [{ name: 'required', message: 'Employee ID is required' }]
            },
            {
              id: 'email_address',
              label: 'Email Address',
              type: 'text',
              default: 'john.smith@acmecorp.com',
              placeholder: 'Enter email address',
              validators: [
                { name: 'required', message: 'Email address is required' },
                { name: 'email', message: 'Please enter a valid email address' }
              ]
            },
            {
              id: 'phone_number',
              label: 'Phone Number',
              type: 'text',
              default: '+1 (555) 123-4567',
              placeholder: '+1 (555) 000-0000',
              validators: [{ name: 'required', message: 'Phone number is required' }]
            },
            {
              id: 'date_of_birth',
              label: 'Date of Birth',
              type: 'date',
              default: '1990-05-15',
              validators: [{ name: 'required', message: 'Date of birth is required' }]
            },
            {
              id: 'emergency_contact',
              label: 'Emergency Contact Name',
              type: 'text',
              default: 'Jane Smith',
              placeholder: 'Emergency contact full name',
              validators: [{ name: 'required', message: 'Emergency contact is required' }]
            },
            {
              id: 'emergency_phone',
              label: 'Emergency Contact Phone',
              type: 'text',
              default: '+1 (555) 987-6543',
              placeholder: '+1 (555) 000-0000',
              validators: [{ name: 'required', message: 'Emergency contact phone is required' }]
            }
          ]
        },
        {
          id: 'employment_information',
          title: 'Employment Information',
          collapsible: true,
          collapsed: true,
          repeatable: false,
          fields: [
            {
              id: 'start_date',
              label: 'Start Date',
              type: 'date',
              default: '2024-01-22',
              validators: [{ name: 'required', message: 'Start date is required' }]
            },
            {
              id: 'department',
              label: 'Department',
              type: 'select',
              default: 'engineering',
              options: [
                { value: '', label: 'Select Department' },
                { value: 'engineering', label: 'Engineering' },
                { value: 'product', label: 'Product Management' },
                { value: 'design', label: 'Design & UX' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'sales', label: 'Sales' },
                { value: 'hr', label: 'Human Resources' },
                { value: 'finance', label: 'Finance' },
                { value: 'operations', label: 'Operations' },
                { value: 'support', label: 'Customer Support' }
              ],
              validators: [{ name: 'required', message: 'Department is required' }]
            },
            {
              id: 'position_title',
              label: 'Position/Title',
              type: 'text',
              default: 'Senior Software Engineer',
              placeholder: 'Enter job title',
              validators: [{ name: 'required', message: 'Position title is required' }]
            },
            {
              id: 'reporting_manager',
              label: 'Reporting Manager',
              type: 'text',
              default: 'Sarah Johnson',
              placeholder: 'Enter manager name',
              validators: [{ name: 'required', message: 'Reporting manager is required' }]
            },
            {
              id: 'work_location',
              label: 'Work Location',
              type: 'select',
              default: 'new_york',
              options: [
                { value: '', label: 'Select Location' },
                { value: 'new_york', label: 'New York Office' },
                { value: 'san_francisco', label: 'San Francisco Office' },
                { value: 'chicago', label: 'Chicago Office' },
                { value: 'remote', label: 'Remote' },
                { value: 'hybrid', label: 'Hybrid' }
              ],
              validators: [{ name: 'required', message: 'Work location is required' }]
            },
            {
              id: 'employment_type',
              label: 'Employment Type',
              type: 'radio',
              default: 'full-time',
              options: [
                { value: 'full-time', label: 'Full-time' },
                { value: 'part-time', label: 'Part-time' },
                { value: 'contract', label: 'Contract' },
                { value: 'intern', label: 'Internship' }
              ],
              validators: [{ name: 'required', message: 'Employment type is required' }]
            },
            {
              id: 'salary_range',
              label: 'Salary Range',
              type: 'select',
              default: '100k-120k',
              options: [
                { value: '', label: 'Select Salary Range' },
                { value: '40k-60k', label: '$40,000 - $60,000' },
                { value: '60k-80k', label: '$60,000 - $80,000' },
                { value: '80k-100k', label: '$80,000 - $100,000' },
                { value: '100k-120k', label: '$100,000 - $120,000' },
                { value: '120k-150k', label: '$120,000 - $150,000' },
                { value: '150k+', label: '$150,000+' }
              ],
              validators: [{ name: 'required', message: 'Salary range is required' }]
            },
            {
              id: 'benefits_eligible',
              label: 'Eligible for Benefits',
              type: 'checkbox',
              default: true,
              validators: []
            },
            {
              id: 'additional_notes',
              label: 'Additional Notes',
              type: 'textarea',
              default: 'New hire with 5+ years experience in React and Node.js. Will be working on the core platform team.',
              placeholder: 'Enter any additional information, special requirements, or notes...',
              attributes: { rows: 4 },
              validators: []
            }
          ]
        },
        {
          id: 'equipment_access',
          title: 'Equipment & Access Requirements',
          collapsible: true,
          collapsed: true,
          repeatable: false,
          fields: [
            {
              id: 'laptop_type',
              label: 'Laptop Preference',
              type: 'radio',
              default: 'macbook',
              options: [
                { value: 'macbook', label: 'MacBook Pro' },
                { value: 'windows', label: 'Windows Laptop' },
                { value: 'linux', label: 'Linux Laptop' }
              ],
              validators: [{ name: 'required', message: 'Laptop preference is required' }]
            },
            {
              id: 'monitor_needed',
              label: 'External Monitor Required',
              type: 'checkbox',
              default: true,
              validators: []
            },
            {
              id: 'phone_needed',
              label: 'Company Phone Required',
              type: 'checkbox',
              default: false,
              validators: []
            },
            {
              id: 'access_systems',
              label: 'Required System Access',
              type: 'textarea',
              default: 'GitHub, Jira, Confluence, Slack, Google Workspace, AWS Console',
              placeholder: 'List all systems and tools the employee needs access to...',
              attributes: { rows: 3 },
              validators: []
            },
            {
              id: 'special_requirements',
              label: 'Special Equipment Requirements',
              type: 'textarea',
              default: '',
              placeholder: 'Any special equipment, software, or accessibility requirements...',
              attributes: { rows: 3 },
              validators: []
            }
          ]
        }
      ]
    } as FormSchema;
  }

  /**
   * Add a new comment
   */
  addComment(): void {
    if (!this.newComment?.trim()) return;

    const newCommentObj = {
      id: this.mockComments.length + 1,
      author: 'John Doe', // Current user
      timestamp: 'Just now',
      text: this.newComment.trim(),
      isInternal: false
    };

    this.mockComments.unshift(newCommentObj);
    this.newComment = '';
    this.showSuccess('Comment added successfully');
    this.cdr.detectChanges();
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
