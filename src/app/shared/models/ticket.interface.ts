/**
 * Ticket Model Interfaces
 * Defines the structure for ticket data and related entities with enhanced type safety
 */

import { BaseEntity, UUID, Timestamp, JsonValue } from './core.types';
import { FormSubmissionData } from './form-schema.interface';

// Enhanced ticket status with workflow states
export type TicketStatus =  'new' 
  | 'assigned'
  | 'in_progress' 
  | 'manual_review'
  | 'completed' 
  | 'failed' ;

// Enhanced priority system
export type TicketPriority = 
  | 'urgent' 
  | 'high' 
  | 'medium' 
  | 'low' ;


// Simplified User interface - only properties actually used in codebase
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
  isActive: boolean;
}

// Ticket type interface
export interface TicketType extends BaseEntity {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  formSchemaId: UUID;
}

// Main ticket interface
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
  priority: TicketPriority;
  type: TicketType;
  category?: string;
  subcategory?: string;
  
  // People and assignment - separate User objects for display
  createdByUser?: User; // Populated user object for display
  assignedTo?: User;
  assignedToId?: UUID; // User ID reference
  reporter?: User; // Customer or person reporting the issue
  
  // Important timestamps
  estimatedResolutionTime?: Timestamp;
  firstResponseAt?: Timestamp;
  lastResponseAt?: Timestamp;
  resolvedAt?: Timestamp;
  completedAt?: Timestamp;
  failedAt?: Timestamp;
  lastViewedAt?: Timestamp;
  
  // Form data and attachments
  formData: FormSubmissionData;
  formSchemaId: UUID;
  formSchemaVersion: string;
  // Custom fields and metadata
  customFields?: { [fieldId: string]: JsonValue };
  labels?: string[]; // Additional labels beyond tags
}

