import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { 
  Ticket, 
  FormSchema, 
  Comment, 
  TicketStatus,
  User,
  TicketType
} from '../models';
import { HistoryItem } from '../models/history.interface';

/**
 * MockDataService - Pure data provider for development and testing
 * 
 * This service ONLY provides mock data. All business logic has been moved to dedicated services:
 * - CommentService handles comment operations
 * - HistoryService handles history operations
 * - TicketService handles ticket operations
 * 
 * This service should ONLY contain data creation methods and basic data provision.
 * NO business logic, state management, or data manipulation should be in this service.
 */
@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  // === PUBLIC DATA PROVISION METHODS ===
  // These methods provide mock data with simulated delays
  // Services should use these methods to get mock data

  /**
   * Get mock ticket data by ID
   */
  getTicketData(ticketId: string): Observable<Ticket> {
    console.log('🎫 Loading ticket data with delay...');
    return of(this.createMockTicket(ticketId)).pipe(delay(2000)); // 2 seconds
  }

  /**
   * Get mock form schema data
   */
  getFormSchemaData(schemaId: string): Observable<FormSchema> {
    console.log('📋 Loading form schema with delay...');
    return of(this.createMockFormSchema()).pipe(delay(1500)); // 1.5 seconds
  }

  /**
   * Get mock comments data for a ticket
   */
  getCommentsData(ticketId: string): Observable<Comment[]> {
    console.log('💬 Loading comments with delay...');
    return of(this.createMockComments()).pipe(delay(1200)); // 1.2 seconds
  }

  /**
   * Get mock history data for a ticket
   */
  getHistoryData(ticketId: string): Observable<HistoryItem[]> {
    console.log('📜 Loading history with delay...');
    return of(this.createMockHistory()).pipe(delay(1000)); // 1 second
  }

  /**
   * Get mock current user data
   */
  getCurrentUserData(): Observable<User> {
    console.log('👤 Loading current user with delay...');
    return of(this.createCurrentUser()).pipe(delay(800)); // 0.8 seconds
  }

  // === HELPER METHODS FOR OTHER SERVICES ===
  // These methods help other services create new entities with proper structure

  /**
   * Create a new comment with proper structure (used by CommentService)
   */
  createCommentEntity(text: string, isInternal: boolean = false): Comment {
    return this.createNewComment(text, isInternal);
  }

  /**
   * Create a new history item with proper structure (used by HistoryService)
   */
  createNewHistoryItem(ticketId: string, action: string, actor: string, details?: string): HistoryItem {
    return {
      id: Date.now(), // Simple ID generation for mock
      ticketId,
      action,
      actor,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      details
    };
  }

  /**
   * Create a new ticket with proper structure (used by TicketService)
   */
  createNewTicket(ticketData: Partial<Ticket>): Ticket {
    const now = new Date();
    const baseTicket = this.createMockTicket('temp_id');
    return {
      ...baseTicket,
      ...ticketData,
      id: ticketData.id || `TICK-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
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
      status: 'new',
      priority: 'medium',
      type: this.createMockTicketType(),
      category: 'hr',
      subcategory: 'onboarding',
      
      // People and assignment
      createdByUser: this.createMockUser('user_001', 'John Doe', 'john.doe@example.com'),
      assignedTo: this.createMockUser('user_002', 'Jane Smith', 'jane.smith@example.com'),
      assignedToId: 'user_002',
      reporter: this.createMockUser('user_003', 'Sarah Johnson', 'sarah.johnson@example.com'),
      
      // Timestamps
      estimatedResolutionTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      
      // Form data
      formData: this.createMockFormData(),
      formSchemaId: 'schema_001',
      formSchemaVersion: '1.0.0',
      
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
                { name: 'minlength', message: 'Name must be at least 2 characters', args: 2 }
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
        timestamp: 'Jan 15 10:30 AM',
        details: 'Employee onboarding ticket created for John Smith. Assigned category: HR, Priority: Medium'
      },
      {
        id: 2,
        ticketId: 'TICK-2024-001',
        action: 'Assigned',
        actor: 'System',
        timestamp: 'Jan 15 10:31 AM',
        details: 'Auto-assigned to Jane Smith based on workload distribution and expertise in employee onboarding processes'
      },
      {
        id: 3,
        ticketId: 'TICK-2024-001',
        action: 'Priority Updated',
        actor: 'Jane Smith',
        timestamp: 'Jan 15 11:45 AM',
        details: 'Priority changed from Medium to High due to start date approaching'
      },
      {
        id: 4,
        ticketId: 'TICK-2024-001',
        action: 'Document Uploaded',
        actor: 'Sarah Johnson',
        timestamp: 'Jan 15 2:15 PM',
        details: 'Uploaded onboarding_checklist.pdf, employee_handbook.pdf, and benefits_enrollment_form.pdf'
      },
      {
        id: 5,
        ticketId: 'TICK-2024-001',
        action: 'Status Updated',
        actor: 'Jane Smith',
        timestamp: 'Jan 16 9:00 AM',
        details: 'Status changed from New to In Progress. Started processing required documentation and system access setup'
      },
      {
        id: 6,
        ticketId: 'TICK-2024-001',
        action: 'Comment Added',
        actor: 'Sarah Johnson',
        timestamp: 'Jan 16 2:30 PM',
        details: 'Added comment about orientation scheduling for January 18th at 10:00 AM in Conference Room B'
      },
      {
        id: 7,
        ticketId: 'TICK-2024-001',
        action: 'Equipment Requested',
        actor: 'Mike Chen',
        timestamp: 'Jan 16 3:45 PM',
        details: 'IT equipment request submitted: MacBook Pro 16", external monitor, keyboard, and mouse'
      },
      {
        id: 8,
        ticketId: 'TICK-2024-001',
        action: 'System Access Granted',
        actor: 'IT Security Team',
        timestamp: 'Jan 17 10:15 AM',
        details: 'Access granted to GitHub, Jira, Confluence, Slack, Google Workspace, and development environment'
      },
      {
        id: 9,
        ticketId: 'TICK-2024-001',
        action: 'Form Updated',
        actor: 'HR Department',
        timestamp: 'Jan 17 1:20 PM',
        details: 'Employee details form updated with final employment terms and workspace assignment (Desk #42)'
      },
      {
        id: 10,
        ticketId: 'TICK-2024-001',
        action: 'Equipment Ready',
        actor: 'IT Support',
        timestamp: 'Jan 17 4:00 PM',
        details: 'All requested equipment has been configured and is ready for pickup. Setup includes development tools and VPN access'
      },
      {
        id: 11,
        ticketId: 'TICK-2024-001',
        action: 'Welcome Package Prepared',
        actor: 'Reception Team',
        timestamp: 'Jan 18 8:30 AM',
        details: 'Welcome package prepared including company swag, office keys, parking pass, and first-day schedule'
      },
      {
        id: 12,
        ticketId: 'TICK-2024-001',
        action: 'Comment Added',
        actor: 'John Smith',
        timestamp: '30 minutes ago',
        details: 'Looking forward to starting! Question about parking arrangements has been answered. Ready for orientation'
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
      isActive: true
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
      isActive: true
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
      formSchemaId: 'schema_001'
    };
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
