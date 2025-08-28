/**
 * API-Specific Interfaces
 * Contains interfaces specific to API operations not covered by core.types.ts
 */

import { LoadingState, AppError, UUID, Timestamp } from './core.types';

// Note: ApiResponse, ValidationError, PaginatedResponse are defined in core.types.ts

// HTTP status code types - commonly used for API responses
export type HttpStatus = 
  | 200 // OK
  | 201 // Created
  | 204 // No Content
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 409 // Conflict
  | 422 // Unprocessable Entity
  | 500 // Internal Server Error
  | 503; // Service Unavailable

// Extends LoadingState from core.types.ts with data property
export interface AsyncOperation<T> extends LoadingState {
  data?: T;
}

// Real-time event interfaces for WebSocket communication
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: Timestamp;
  id: UUID;
}

export interface TicketUpdateEvent {
  ticketId: UUID;
  eventType: 'updated' | 'commented' | 'status_changed' | 'assigned';
  data: any;
  actor: {
    id: UUID;
    name: string;
  };
}

// File upload interfaces for attachment handling
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
  remainingTime?: number; // seconds
}

export interface FileUploadResponse {
  fileId: UUID;
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Timestamp;
}
