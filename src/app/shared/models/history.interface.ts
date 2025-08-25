/**
 * History/Audit Model Interfaces
 * Defines the structure for ticket history and audit events
 */

import { User } from './ticket.interface';

export type HistoryEventType = 
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'priority_changed'
  | 'assigned'
  | 'unassigned'
  | 'commented'
  | 'attachment_added'
  | 'attachment_removed'
  | 'tag_added'
  | 'tag_removed'
  | 'field_updated'
  | 'form_submitted'
  | 'form_saved'
  | 'section_added'
  | 'section_removed'
  | 'merged'
  | 'split'
  | 'linked'
  | 'unlinked'
  | 'archived'
  | 'restored'
  | 'locked'
  | 'unlocked'
  | 'escalated'
  | 'sla_warning'
  | 'sla_breached'
  | 'custom';

export type ChangeType = 'create' | 'update' | 'delete';

export interface FieldChange {
  fieldName: string;
  fieldLabel?: string;
  sectionId?: string;
  sectionTitle?: string;
  oldValue?: any;
  newValue?: any;
  changeType: ChangeType;
  dataType?: string;
}

export interface HistoryEvent {
  id: string;
  ticketId: string;
  eventType: HistoryEventType;
  timestamp: Date;
  actor: User;
  
  // Event details
  title: string;
  description?: string;
  
  // Change tracking
  changes?: FieldChange[];
  
  // Related entities
  relatedCommentId?: string;
  relatedAttachmentId?: string;
  relatedUserId?: string;
  relatedTicketId?: string;
  
  // System metadata
  source?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  
  // Custom data
  customData?: {
    [key: string]: any;
  };
  
  // Visibility
  isVisible: boolean;
  isSystemGenerated: boolean;
  
  // Categorization
  category?: string;
  severity?: 'low' | 'medium' | 'high';
  
  // Rollback information
  isReversible?: boolean;
  rollbackData?: any;
}

export interface HistoryEventSummary {
  id: string;
  ticketId: string;
  eventType: HistoryEventType;
  timestamp: Date;
  actor: User;
  title: string;
  changeCount: number;
  category?: string;
}

export interface CreateHistoryEventRequest {
  ticketId: string;
  eventType: HistoryEventType;
  title: string;
  description?: string;
  changes?: FieldChange[];
  relatedCommentId?: string;
  relatedAttachmentId?: string;
  relatedUserId?: string;
  relatedTicketId?: string;
  customData?: any;
  category?: string;
  severity?: 'low' | 'medium' | 'high';
  isVisible?: boolean;
  rollbackData?: any;
}

export interface HistoryQuery {
  ticketId?: string;
  eventType?: HistoryEventType[];
  actorId?: string;
  category?: string;
  severity?: string[];
  timestampAfter?: Date;
  timestampBefore?: Date;
  includeSystemEvents?: boolean;
  includeInvisibleEvents?: boolean;
  hasChanges?: boolean;
  relatedUserId?: string;
  relatedTicketId?: string;
  searchTerm?: string;
  sortBy?: 'timestamp' | 'eventType' | 'actor';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  groupByDate?: boolean;
}

export interface HistoryListResponse {
  events: HistoryEvent[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  groupedEvents?: {
    [date: string]: HistoryEvent[];
  };
}

export interface HistoryStatistics {
  ticketId: string;
  totalEvents: number;
  eventsByType: {
    [eventType: string]: number;
  };
  activeActors: User[];
  firstEventDate?: Date;
  lastEventDate?: Date;
  mostActiveDay?: string;
  averageEventsPerDay?: number;
}

// Utility interfaces for complex history scenarios
export interface BulkHistoryOperation {
  ticketIds: string[];
  operation: HistoryEventType;
  metadata: any;
  performedBy: string;
  timestamp: Date;
}

export interface HistoryExportRequest {
  ticketId?: string;
  ticketIds?: string[];
  query?: HistoryQuery;
  format: 'json' | 'csv' | 'pdf';
  includeDetails?: boolean;
  includeChanges?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
