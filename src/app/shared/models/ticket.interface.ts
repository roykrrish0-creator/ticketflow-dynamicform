/**
 * Ticket Model Interfaces
 * Defines the structure for ticket data and related entities with enhanced type safety
 */

import { BaseEntity, UUID, Timestamp, JsonValue, PaginationRequest, PaginatedResponse, SearchCriteria } from './core.types';
import { FormSubmissionData } from './form-schema.interface';

// Enhanced ticket status with workflow states
export type TicketStatusCategory = 'new' | 'active' | 'resolved' | 'closed';
export type TicketStatus = 
  | 'draft' 
  | 'submitted'
  | 'open' 
  | 'assigned'
  | 'in_progress' 
  | 'on_hold'
  | 'pending_review'
  | 'pending_customer'
  | 'resolved' 
  | 'closed' 
  | 'cancelled'
  | 'reopened';

// Enhanced priority system
export type TicketPriority = 
  | 'urgent' 
  | 'high' 
  | 'medium' 
  | 'low' 
  | 'planning';

// Enhanced SLA status with more granular tracking
export type SLAStatus = 
  | 'on_track' 
  | 'at_risk' 
  | 'warning'
  | 'overdue' 
  | 'met' 
  | 'breached'
  | 'paused'
  | 'exempted';

// Enhanced user interface with additional properties
export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  name: string; // Full name for display
  avatar?: string;
  roles: string[];
  department?: string;
  title?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  isActive: boolean;
  lastLoginAt?: Timestamp;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  metadata?: JsonValue;
}

// Enhanced ticket tag with hierarchical support
export interface TicketTag extends BaseEntity {
  name: string;
  slug: string;
  color: string;
  backgroundColor?: string;
  textColor?: string;
  description?: string;
  icon?: string;
  parentId?: UUID;
  children?: TicketTag[];
  isSystemTag?: boolean;
  sortOrder?: number;
  usageCount?: number;
}

// Enhanced SLA metrics with detailed tracking
export interface SLAMetrics {
  id: UUID;
  name: string;
  description?: string;
  priority: TicketPriority;
  
  // Time tracking (in minutes for precision)
  responseTime: {
    target: number;
    actual?: number;
    remaining?: number;
    status: SLAStatus;
    breachAt?: Timestamp;
  };
  
  resolutionTime: {
    target: number;
    actual?: number;
    remaining?: number;
    status: SLAStatus;
    breachAt?: Timestamp;
  };
  
  // Business hours configuration
  businessHours: {
    timezone: string;
    workingDays: number[]; // 0=Sunday, 1=Monday, etc.
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    holidays?: Timestamp[];
  };
  
  // Escalation rules
  escalation?: {
    enabled: boolean;
    levels: {
      level: number;
      triggerAfter: number; // minutes
      assignTo?: UUID;
      notifyUsers: UUID[];
      action?: 'reassign' | 'notify' | 'escalate';
    }[];
  };
  
  // Pause conditions
  pauseConditions?: {
    statuses: TicketStatus[];
    fieldConditions?: { [fieldId: string]: any };
  };
}

// Enhanced ticket type with workflow configuration
export interface TicketType extends BaseEntity {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  formSchemaId: UUID;
  slaId?: UUID;
  
  // Workflow configuration
  workflow: {
    initialStatus: TicketStatus;
    allowedTransitions: {
      from: TicketStatus;
      to: TicketStatus[];
      conditions?: JsonValue;
      requiredPermissions?: string[];
    }[];
  };
  
  // Auto-assignment rules
  autoAssignment?: {
    enabled: boolean;
    rules: {
      condition: JsonValue;
      assignTo: UUID | 'round_robin' | 'least_loaded';
      priority?: number;
    }[];
  };
}

// Enhanced main ticket interface - manually define base fields to avoid BaseEntity conflicts
export interface Ticket {
  // Base entity fields with UUID references
  id: UUID;
  createdAt: Timestamp;
  createdBy: UUID; // User ID reference
  updatedAt?: Timestamp;
  updatedBy?: UUID;
  version: number;
  isDeleted?: boolean;
  deletedAt?: Timestamp;
  deletedBy?: UUID;
  
  // Ticket-specific fields
  ticketNumber: string; // Human-readable ticket number
  title: string;
  description?: string;
  status: TicketStatus;
  statusHistory: {
    status: TicketStatus;
    changedAt: Timestamp;
    changedBy: UUID;
    reason?: string;
  }[];
  
  priority: TicketPriority;
  priorityHistory: {
    priority: TicketPriority;
    changedAt: Timestamp;
    changedBy: UUID;
    reason?: string;
  }[];
  
  type: TicketType;
  category?: string;
  subcategory?: string;
  
  // People and assignment - separate User objects for display
  createdByUser?: User; // Populated user object for display
  assignedTo?: User;
  assignedToId?: UUID; // User ID reference
  assignmentHistory: {
    assignedTo?: UUID;
    assignedAt: Timestamp;
    assignedBy: UUID;
    reason?: string;
  }[];
  
  reporter?: User; // Customer or person reporting the issue
  watchers: UUID[]; // Users watching this ticket
  
  // Important timestamps
  dueDate?: Timestamp;
  estimatedResolutionTime?: Timestamp;
  firstResponseAt?: Timestamp;
  lastResponseAt?: Timestamp;
  resolvedAt?: Timestamp;
  closedAt?: Timestamp;
  lastViewedAt?: Timestamp;
  
  // SLA tracking
  sla?: SLAMetrics;
  slaHistory: {
    event: 'started' | 'paused' | 'resumed' | 'breached' | 'met';
    timestamp: Timestamp;
    reason?: string;
    remainingTime?: number;
  }[];
  
  // Organization and relationships
  tags: TicketTag[];
  parentTicketId?: UUID;
  childTicketIds: UUID[];
  relatedTicketIds: UUID[];
  duplicateOf?: UUID;
  duplicates: UUID[];
  
  // Form data and attachments
  formData: FormSubmissionData;
  formSchemaId: UUID;
  formSchemaVersion: string;
  
  // Counters and metrics
  metrics: {
    commentCount: number;
    attachmentCount: number;
    viewCount: number;
    editCount: number;
    reopenCount: number;
    timeSpentMinutes?: number;
  };
  
  // Location and channel information
  source: {
    channel: 'web' | 'email' | 'phone' | 'chat' | 'api' | 'mobile';
    origin?: string; // URL, email address, etc.
    userAgent?: string;
    ipAddress?: string;
  };
  
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
  
  // Flags and states
  flags: {
    isLocked: boolean;
    isArchived: boolean;
    isFlagged: boolean;
    isUrgent: boolean;
    isEscalated: boolean;
    isOverdue: boolean;
    hasUnreadComments: boolean;
    requiresAttention: boolean;
  };
  
  // Custom fields and metadata
  customFields?: { [fieldId: string]: JsonValue };
  labels?: string[]; // Additional labels beyond tags
  
  // Satisfaction and feedback
  satisfaction?: {
    rating: number; // 1-5 stars
    feedback?: string;
    ratedAt: Timestamp;
    ratedBy: UUID;
  };
  
  // Integration data
  externalReferences?: {
    system: string;
    id: string;
    url?: string;
    syncedAt?: Timestamp;
  }[];
}

export interface TicketSummary {
  id: string;
  title?: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: User;
  assignedTo?: User;
  createdAt: Date;
  updatedAt: Date;
  sla?: SLAMetrics;
  tags: TicketTag[];
  commentCount: number;
  attachmentCount: number;
}

// FormSubmissionData already imported at top

export interface CreateTicketRequest {
  title?: string;
  description?: string;
  type: string;
  priority: TicketPriority;
  category?: string;
  subcategory?: string;
  assignedToId?: string;
  reporterId?: string;
  dueDate?: Date;
  tags?: string[];
  formData: FormSubmissionData;
  formSchemaId: string;
  metadata?: any;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  subcategory?: string;
  assignedToId?: string;
  dueDate?: Date;
  tags?: string[];
  formData?: FormSubmissionData;
  metadata?: any;
}

export interface TicketSearchQuery {
  query?: string;
  status?: TicketStatus[];
  priority?: TicketPriority[];
  assignedToId?: string;
  createdById?: string;
  type?: string;
  category?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  dueAfter?: Date;
  dueBefore?: Date;
  isOverdue?: boolean;
  hasComments?: boolean;
  hasAttachments?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TicketListResponse {
  tickets: TicketSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
