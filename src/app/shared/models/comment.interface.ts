/**
 * Comment Model Interfaces
 * Defines the structure for ticket comments and attachments
 */

import { User } from './ticket.interface';

export type CommentType = 
  | 'comment' 
  | 'internal_note' 
  | 'system_message' 
  | 'status_change' 
  | 'assignment_change';

export type AttachmentType = 
  | 'image' 
  | 'document' 
  | 'video' 
  | 'audio' 
  | 'archive' 
  | 'other';

export interface Attachment {
  id: string;
  name: string;
  originalName: string;
  type: AttachmentType;
  mimeType: string;
  size: number; // bytes
  url: string;
  thumbnailUrl?: string;
  downloadUrl: string;
  uploadedAt: Date;
  uploadedBy: User;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number; // for video/audio
    pages?: number; // for documents
    [key: string]: any;
  };
}

export interface Comment {
  id: string;
  ticketId: string;
  parentCommentId?: string; // For threaded comments
  type: CommentType;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt?: Date;
  editedAt?: Date;
  
  // Attachments
  attachments: Attachment[];
  
  // Metadata
  isInternal: boolean;
  isSystemGenerated: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  
  // Reactions/Interactions
  reactions?: {
    [emoji: string]: {
      count: number;
      users: string[]; // user IDs
    };
  };
  
  // Threading
  replies?: Comment[];
  replyCount?: number;
  
  // Rich content metadata
  mentions?: User[];
  linkedTickets?: string[];
  
  // Formatting
  contentFormat?: 'plain' | 'markdown' | 'html';
  
  metadata?: {
    source?: string;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
  };
}

export interface CommentSummary {
  id: string;
  ticketId: string;
  type: CommentType;
  content: string; // truncated
  author: User;
  createdAt: Date;
  attachmentCount: number;
  replyCount: number;
  isInternal: boolean;
}

export interface CreateCommentRequest {
  ticketId: string;
  parentCommentId?: string;
  type?: CommentType;
  content: string;
  attachmentIds?: string[];
  isInternal?: boolean;
  contentFormat?: 'plain' | 'markdown' | 'html';
  mentions?: string[]; // user IDs
  linkedTickets?: string[];
}

export interface UpdateCommentRequest {
  content?: string;
  attachmentIds?: string[];
  isInternal?: boolean;
  contentFormat?: 'plain' | 'markdown' | 'html';
  mentions?: string[];
  linkedTickets?: string[];
}

export interface CommentListQuery {
  ticketId?: string;
  parentCommentId?: string;
  type?: CommentType[];
  authorId?: string;
  includeInternal?: boolean;
  includeDeleted?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  hasAttachments?: boolean;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CommentListResponse {
  comments: Comment[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AttachmentUploadRequest {
  file: File;
  ticketId?: string;
  commentId?: string;
  description?: string;
  isInternal?: boolean;
}

export interface AttachmentUploadResponse {
  attachment: Attachment;
  uploadToken?: string;
}
