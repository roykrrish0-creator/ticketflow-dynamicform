/**
 * Common API Response Interfaces
 * Defines the structure for API responses and error handling
 */

import { ValidationError, LoadingState } from './core.types';

// ApiResponse is defined in core.types.ts - using that definition

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
    timestamp: Date;
    requestId: string;
    traceId?: string;
  };
}

// ValidationError is defined in core.types.ts - using that definition

export interface ApiValidationError {
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    validationErrors: ValidationError[];
    timestamp: Date;
    requestId: string;
  };
}

// PaginatedResponse is defined in core.types.ts - using that definition

// This will be replaced with the core types version

// HTTP status code types
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
  | 429 // Too Many Requests
  | 500 // Internal Server Error
  | 503; // Service Unavailable

// LoadingState is defined in core.types.ts - using that definition

export interface AsyncOperation<T> extends LoadingState {
  data?: T;
}

// API configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers?: { [key: string]: string };
}

// Webhook/real-time event interfaces
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
  id: string;
}

export interface TicketUpdateEvent {
  ticketId: string;
  eventType: 'updated' | 'commented' | 'status_changed' | 'assigned';
  data: any;
  actor: {
    id: string;
    name: string;
  };
}

// File upload interfaces
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
  remainingTime?: number; // seconds
}

export interface FileUploadResponse {
  fileId: string;
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}
