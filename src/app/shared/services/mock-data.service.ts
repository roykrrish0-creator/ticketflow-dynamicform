import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { 
  Ticket, 
  FormSchema, 
  Comment, 
  TicketStatus,
  User,
  TicketTag,
  TicketType
} from '../models';
import { HistoryItem } from '../models/history.interface';

/**
 * MockDataService - Centralized service for providing mock data
 * 
 * TODO: Replace this service with actual API services:
 * - TicketService for ticket CRUD operations
 * - CommentService for comment operations  
 * - HistoryService for ticket history
 * - UserService for user data
 * - FormSchemaService for dynamic form schemas
 */
@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  /**
   * Get ticket by ID
   * TODO: Replace with actual API call to GET /api/tickets/{id}
   */
  getTicketById(ticketId: string): Observable<Ticket> {
    return of(this.createMockTicket(ticketId)).pipe(delay(800));
  }

  /**
   * Get form schema for ticket
   * TODO: Replace with actual API call to GET /api/form-schemas/{schemaId}
   */
  getFormSchema(schemaId: string): Observable<FormSchema> {
    return of(this.createMockFormSchema()).pipe(delay(600));
  }

  /**
   * Get comments for a ticket
   * TODO: Replace with actual API call to GET /api/tickets/{ticketId}/comments
   */
  getTicketComments(ticketId: string): Observable<Comment[]> {
    return of(this.createMockComments()).pipe(delay(400));
  }

  /**
   * Add a new comment to a ticket
   * TODO: Replace with actual API call to POST /api/tickets/{ticketId}/comments
   */
  addComment(ticketId: string, commentText: string, isInternal: boolean = false): Observable<Comment> {
    const newComment = this.createNewComment(commentText, isInternal);
    return of(newComment).pipe(delay(500));
  }

  /**
   * Get ticket history
   * TODO: Replace with actual API call to GET /api/tickets/{ticketId}/history
   */
  getTicketHistory(ticketId: string): Observable<HistoryItem[]> {
    return of(this.createMockHistory()).pipe(delay(300));
  }

  /**
   * Save ticket data
   * TODO: Replace with actual API call to PUT /api/tickets/{ticketId}
   */
  saveTicket(ticketId: string, formData: any): Observable<Ticket> {
    // Simulate save operation
    const updatedTicket = this.createMockTicket(ticketId);
    updatedTicket.formData = formData;
    updatedTicket.updatedAt = new Date();
    return of(updatedTicket).pipe(delay(1000));
  }

  /**
   * Save ticket as draft
   * TODO: Replace with actual API call to PUT /api/tickets/{ticketId}/draft
   */
  saveDraft(ticketId: string, formData: any): Observable<void> {
    // Simulate draft save operation
    return of(void 0).pipe(delay(500));
  }

  /**
   * Get current user information
   * TODO: Replace with actual API call to GET /api/auth/me
   */
  getCurrentUser(): Observable<User> {
    return of(this.createCurrentUser()).pipe(delay(200));
  }

  // === PRIVATE MOCK DATA CREATION METHODS ===

  private createMockTicket(ticketId: string): Ticket {
    const now = new Date();
    const createdDate = new Date('2024-01-15T10:30:00Z');
    
    return {
      // Base entity fields
      id: ticketId,
      createdAt: createdDate,
      createdBy: 'user_001',
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
      
      type: this.createMockTicketType(),
      category: 'hr',
      subcategory: 'onboarding',
      
      // People and assignment
      createdByUser: this.createMockUser('user_001', 'John Doe', 'john.doe@example.com'),
      assignedTo: this.createMockUser('user_002', 'Jane Smith', 'jane.smith@example.com'),
      assignedToId: 'user_002',
      assignmentHistory: [
        {
          assignedTo: 'user_002',
          assignedAt: createdDate,
          assignedBy: 'user_001',
          reason: 'Auto-assigned based on workload'
        }
      ],
      
      watchers: ['user_003', 'user_004'],
      
      // Timestamps
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedResolutionTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      
      // SLA tracking
      slaHistory: [
        {
          event: 'started',
          timestamp: createdDate,
          reason: 'Ticket created and SLA timer started'
        }
      ],
      
      // Organization and relationships
      tags: this.createMockTags(),
      childTicketIds: [],
      relatedTicketIds: [],
      duplicates: [],
      
      // Form data
      formData: this.createMockFormData(),
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

  private createMockComments(): Comment[] {
    return [
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
  }

  private createMockHistory(): HistoryItem[] {
    return [
      {
        id: 1,
        ticketId: 'TICK-2024-001',
        action: 'Ticket Created',
        actor: 'John Doe',
        timestamp: '2024-01-15 10:30 AM',
        details: 'Employee onboarding ticket created for John Smith'
      },
      {
        id: 2,
        ticketId: 'TICK-2024-001',
        action: 'Assigned',
        actor: 'System',
        timestamp: '2024-01-15 10:31 AM',
        details: 'Auto-assigned to Jane Smith based on workload distribution'
      },
      {
        id: 3,
        ticketId: 'TICK-2024-001',
        action: 'Document Uploaded',
        actor: 'Sarah Johnson',
        timestamp: '2024-01-15 2:15 PM',
        details: 'Uploaded onboarding_checklist.pdf'
      },
      {
        id: 4,
        ticketId: 'TICK-2024-001',
        action: 'Status Updated',
        actor: 'Jane Smith',
        timestamp: '2024-01-16 9:00 AM',
        details: 'Status changed from Open to In Progress'
      },
      {
        id: 5,
        ticketId: 'TICK-2024-001',
        action: 'Comment Added',
        actor: 'Sarah Johnson',
        timestamp: '2024-01-16 2:30 PM',
        details: 'Added comment about orientation scheduling'
      }
    ];
  }

  private createNewComment(text: string, isInternal: boolean): Comment {
    return {
      id: Date.now(), // Simple ID generation for mock
      author: 'John Doe', // Current user
      timestamp: 'Just now',
      text: text,
      isInternal: isInternal
    };
  }

  private createCurrentUser(): User {
    const now = new Date();
    return {
      id: 'user_001',
      createdAt: now,
      createdBy: 'system',
      updatedAt: now,
      version: 1,
      username: 'john.doe',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John Doe',
      name: 'John Doe',
      avatar: 'https://via.placeholder.com/40',
      roles: ['user', 'agent'],
      department: 'Engineering',
      isActive: true,
      preferences: {
        notifications: true,
        emailUpdates: true,
        theme: 'light' as const,
        language: 'en'
      }
    };
  }

  private createMockUser(id: string, name: string, email: string): User {
    const now = new Date();
    const [firstName, lastName] = name.split(' ');
    
    return {
      id,
      createdAt: now,
      createdBy: 'system',
      updatedAt: now,
      version: 1,
      username: email.split('@')[0],
      email,
      firstName,
      lastName,
      displayName: name,
      name,
      avatar: 'https://via.placeholder.com/40',
      roles: ['user'],
      department: 'HR',
      isActive: true,
      preferences: {
        notifications: true,
        emailUpdates: true,
        theme: 'light' as const,
        language: 'en'
      }
    };
  }

  private createMockTicketType(): TicketType {
    const now = new Date();
    return {
      id: 'tt_support_001',
      createdAt: now,
      createdBy: 'system',
      updatedAt: now,
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
  }

  private createMockTags(): TicketTag[] {
    const now = new Date();
    return [
      {
        id: 'tag_001',
        createdAt: now,
        createdBy: 'system',
        updatedAt: now,
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
        createdAt: now,
        createdBy: 'system',
        updatedAt: now,
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
  }

  private createMockFormData(): any {
    return {
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
    };
  }
}
