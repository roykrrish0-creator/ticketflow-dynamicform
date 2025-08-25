/**
 * Core Type Definitions
 * Foundation types used throughout the application
 */

// Base utility types
export type UUID = string;
export type Timestamp = Date;
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

// API Response wrapper
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ValidationError[];
  metadata?: {
    timestamp: Timestamp;
    version: string;
    requestId: string;
    executionTime?: number;
  };
}

// Error handling types
export interface ValidationError {
  field?: string;
  code: string;
  message: string;
  details?: JsonValue;
}

export interface AppError {
  id: UUID;
  type: 'validation' | 'business' | 'system' | 'network' | 'permission';
  code: string;
  message: string;
  details?: JsonValue;
  timestamp: Timestamp;
  stack?: string;
  context?: JsonObject;
}

// Pagination types
export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> extends PaginationResponse {
  data: T[];
}

// Audit information
export interface AuditInfo {
  createdAt: Timestamp;
  createdBy: UUID;
  updatedAt?: Timestamp;
  updatedBy?: UUID;
  version: number;
}

// Base entity interface
export interface BaseEntity extends AuditInfo {
  id: UUID;
  isDeleted?: boolean;
  deletedAt?: Timestamp;
  deletedBy?: UUID;
}

// Status types
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'archived';
export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Search and filter types
export interface SearchCriteria {
  query?: string;
  filters?: { [key: string]: any };
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
}

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  features: {
    [featureName: string]: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    dateFormat: string;
    timeZone: string;
  };
  performance: {
    debounceTime: number;
    cacheTimeout: number;
    maxCacheSize: number;
  };
}

// Event types
export interface AppEvent<T = any> {
  type: string;
  timestamp: Timestamp;
  source: string;
  data: T;
  metadata?: JsonObject;
}

// Result wrapper for operations that can fail
export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Utility functions for Result type
export const Result = {
  success: <T>(data: T): Result<T> => ({ success: true, data }),
  error: <T, E = AppError>(error: E): Result<T, E> => ({ success: false, error }),
  isSuccess: <T, E>(result: Result<T, E>): result is { success: true; data: T } => result.success,
  isError: <T, E>(result: Result<T, E>): result is { success: false; error: E } => !result.success
};

// Loading state management
export interface LoadingState {
  isLoading: boolean;
  error?: AppError;
  lastUpdated?: Timestamp;
}

export interface AsyncState<T> extends LoadingState {
  data?: T;
}

// Permission and access control
export interface Permission {
  resource: string;
  action: string;
  conditions?: JsonObject;
}

export interface Role {
  id: UUID;
  name: string;
  permissions: Permission[];
  isSystemRole?: boolean;
}

export interface AccessContext {
  userId: UUID;
  roles: Role[];
  permissions: Permission[];
  sessionId?: UUID;
}
