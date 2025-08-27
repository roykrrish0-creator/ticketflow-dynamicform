/**
 * Comment Model Interfaces
 * Simplified structure for ticket comments based on UI requirements
 */

/**
 * Simple comment interface matching the UI design
 * Contains only essential fields needed for display and functionality
 */
export interface Comment {
  id: string | number;
  author: string; // Author's display name
  timestamp: string; // Human-readable timestamp (e.g., "1 hour ago")
  text: string; // Comment content
  isInternal: boolean; // Whether comment is internal/private
}

/**
 * Request interface for creating new comments
 */
export interface CreateCommentRequest {
  ticketId: string;
  text: string;
  isInternal?: boolean;
}

/**
 * Response interface for comment operations
 */
export interface CommentResponse {
  success: boolean;
  comment?: Comment;
  message?: string;
}
