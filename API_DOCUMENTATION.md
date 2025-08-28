# TicketFlow API Documentation

> **Generated from Codebase Analysis**  
> This documentation outlines all the required API endpoints and their schemas based on the application's data flow and service implementations.

## Table of Contents

1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [Authentication](#authentication)
4. [Ticket Management](#ticket-management)
5. [Form Schema Management](#form-schema-management)
6. [Comments Management](#comments-management)
7. [History Management](#history-management)
8. [User Management](#user-management)
9. [Error Handling](#error-handling)
10. [Data Models](#data-models)

---

## Overview

The TicketFlow application requires a RESTful API that supports:

- **Ticket CRUD operations** with dynamic forms
- **Form schema management** for flexible ticket types
- **Comment system** with internal/external visibility
- **History tracking** for all ticket activities
- **User management** with role-based access
- **Real-time updates** via WebSocket (optional)

### API Base URL
```
https://api.ticketflow.com/v1
```

---

## Base Configuration

### HTTP Headers
All requests should include:
```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
X-Request-ID: <UNIQUE_REQUEST_ID>
```

### Response Format
All responses follow this structure:
```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ValidationError[];
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
    executionTime?: number;
  };
}
```

---

## Authentication

### POST /auth/login
**Description:** Authenticate user and get access token

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": "user_001",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "roles": ["user", "agent"],
      "department": "Engineering",
      "avatar": "https://api.example.com/avatars/user_001.jpg"
    }
  },
  "success": true,
  "metadata": {
    "timestamp": "2024-01-28T10:30:00Z",
    "version": "1.0.0",
    "requestId": "req_001"
  }
}
```

### POST /auth/refresh
**Description:** Refresh access token

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### POST /auth/logout
**Description:** Invalidate current session

---

## Ticket Management

### GET /tickets/:ticketId
**Description:** Retrieve a specific ticket with all its data

**URL Parameters:**
- `ticketId` (string): Unique ticket identifier

**Response:**
```json
{
  "data": {
    "id": "TICK-2024-001",
    "ticketNumber": "TICK-2024-001",
    "title": "Employee Onboarding - John Smith",
    "description": "Complete onboarding process for new hire John Smith",
    "status": "new",
    "priority": "medium",
    "type": {
      "id": "tt_support_001",
      "name": "employee_onboarding",
      "description": "Employee onboarding process",
      "icon": "person_add",
      "color": "#4CAF50"
    },
    "category": "hr",
    "subcategory": "onboarding",
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": "user_001",
    "createdByUser": {
      "id": "user_001",
      "displayName": "John Doe",
      "email": "john.doe@example.com",
      "avatar": "https://api.example.com/avatars/user_001.jpg"
    },
    "updatedAt": "2024-01-16T14:30:00Z",
    "updatedBy": "user_002",
    "assignedTo": {
      "id": "user_002",
      "displayName": "Jane Smith",
      "email": "jane.smith@example.com",
      "department": "HR"
    },
    "assignedToId": "user_002",
    "reporter": {
      "id": "user_003",
      "displayName": "Sarah Johnson",
      "email": "sarah.johnson@example.com"
    },
    "estimatedResolutionTime": "2024-01-18T10:30:00Z",
    "version": 1,
    "formData": {
      "basic_information": {
        "ticket_id": "#1234",
        "process_type": "employee_onboarding",
        "client": "Acme Corp",
        "priority_level": "medium",
        "due_date": "2024-02-15"
      },
      "employee_details": {
        "full_name": "John Smith",
        "employee_id": "EMP-2024-001",
        "email_address": "john.smith@acmecorp.com",
        "phone_number": "+1 (555) 123-4567"
      }
    },
    "formSchemaId": "schema_001",
    "formSchemaVersion": "1.0.0",
    "customFields": {
      "client": "Acme Corp",
      "cost_center": "CC-001",
      "project_code": "PROJ-2024-001"
    },
    "labels": ["new-hire", "high-priority", "onboarding"]
  },
  "success": true
}
```

### PUT /tickets/:ticketId
**Description:** Update ticket data (full save)

**Request:**
```json
{
  "formData": {
    "basic_information": {
      "ticket_id": "#1234",
      "process_type": "employee_onboarding",
      "client": "Acme Corp",
      "priority_level": "high",
      "due_date": "2024-02-10"
    }
  },
  "customFields": {
    "urgency_reason": "Start date moved up"
  }
}
```

**Response:**
```json
{
  "data": {
    // Updated ticket object (same structure as GET)
    "version": 2,
    "updatedAt": "2024-01-16T15:45:00Z"
  },
  "success": true,
  "message": "Ticket updated successfully"
}
```

### PATCH /tickets/:ticketId/draft
**Description:** Save ticket as draft (auto-save functionality)

**Request:**
```json
{
  "formData": {
    "employee_details": {
      "full_name": "John Smith Jr.",
      "employee_id": "EMP-2024-001"
    }
  }
}
```

**Response:**
```json
{
  "data": null,
  "success": true,
  "message": "Draft saved successfully"
}
```

### POST /tickets
**Description:** Create a new ticket

**Request:**
```json
{
  "title": "Employee Onboarding - Jane Doe",
  "description": "Complete onboarding process for new hire",
  "type": "employee_onboarding",
  "priority": "medium",
  "category": "hr",
  "assignedToId": "user_002",
  "reporterId": "user_003",
  "formData": {
    "basic_information": {
      "process_type": "employee_onboarding",
      "client": "Tech Corp"
    }
  }
}
```

### PATCH /tickets/:ticketId/status
**Description:** Update ticket status

**Request:**
```json
{
  "status": "in_progress",
  "reason": "Started processing documentation"
}
```

### PATCH /tickets/:ticketId/assignment
**Description:** Update ticket assignment

**Request:**
```json
{
  "assignedToId": "user_004",
  "reason": "Reassigned due to workload distribution"
}
```

### DELETE /tickets/:ticketId
**Description:** Delete (soft delete) a ticket

**Response:**
```json
{
  "data": true,
  "success": true,
  "message": "Ticket deleted successfully"
}
```

---

## Form Schema Management

### GET /form-schemas/:schemaId
**Description:** Retrieve form schema for dynamic form rendering

**Response:**
```json
{
  "data": {
    "id": "employee_onboarding_v1",
    "title": "Employee Onboarding Form",
    "description": "Complete employee onboarding form",
    "sections": [
      {
        "id": "basic_information",
        "title": "Basic Information",
        "collapsible": true,
        "collapsed": false,
        "repeatable": false,
        "fields": [
          {
            "id": "ticket_id",
            "label": "Ticket ID",
            "type": "text",
            "default": "",
            "readOnly": true,
            "validators": []
          },
          {
            "id": "process_type",
            "label": "Process Type",
            "type": "select",
            "default": "employee_onboarding",
            "options": [
              {
                "value": "employee_onboarding",
                "label": "Employee Onboarding"
              },
              {
                "value": "employee_offboarding",
                "label": "Employee Offboarding"
              }
            ],
            "validators": [
              {
                "name": "required",
                "message": "Process type is required"
              }
            ]
          },
          {
            "id": "priority_level",
            "label": "Priority Level",
            "type": "radio",
            "default": "medium",
            "options": [
              { "value": "low", "label": "Low" },
              { "value": "medium", "label": "Medium" },
              { "value": "high", "label": "High" },
              { "value": "urgent", "label": "Urgent" }
            ],
            "validators": [
              {
                "name": "required",
                "message": "Priority level is required"
              }
            ]
          },
          {
            "id": "due_date",
            "label": "Due Date",
            "type": "date",
            "validators": [
              {
                "name": "required",
                "message": "Due date is required"
              }
            ]
          }
        ]
      },
      {
        "id": "employee_details",
        "title": "Employee Details",
        "collapsible": true,
        "collapsed": true,
        "repeatable": false,
        "fields": [
          {
            "id": "full_name",
            "label": "Full Name",
            "type": "text",
            "placeholder": "Enter full name",
            "validators": [
              {
                "name": "required",
                "message": "Full name is required"
              },
              {
                "name": "minlength",
                "message": "Name must be at least 2 characters",
                "args": 2
              }
            ]
          },
          {
            "id": "email_address",
            "label": "Email Address",
            "type": "text",
            "placeholder": "Enter email address",
            "validators": [
              {
                "name": "required",
                "message": "Email address is required"
              },
              {
                "name": "email",
                "message": "Please enter a valid email address"
              }
            ]
          },
          {
            "id": "date_of_birth",
            "label": "Date of Birth",
            "type": "date",
            "validators": [
              {
                "name": "required",
                "message": "Date of birth is required"
              }
            ]
          },
          {
            "id": "additional_notes",
            "label": "Additional Notes",
            "type": "textarea",
            "placeholder": "Enter any additional information...",
            "attributes": {
              "rows": 4
            },
            "validators": []
          }
        ]
      }
    ]
  },
  "success": true
}
```

### GET /form-schemas
**Description:** List available form schemas

**Query Parameters:**
- `active` (boolean): Filter by active schemas only
- `category` (string): Filter by category

---

## Comments Management

### GET /tickets/:ticketId/comments
**Description:** Retrieve comments for a ticket

**Query Parameters:**
- `includeInternal` (boolean): Include internal comments (default: true for authorized users)
- `limit` (number): Limit number of comments (default: 50)
- `offset` (number): Offset for pagination (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "author": "Sarah Johnson",
      "timestamp": "2 hours ago",
      "text": "I've started the onboarding process for John Smith. All documentation has been prepared.",
      "isInternal": false
    },
    {
      "id": 2,
      "author": "Mike Chen",
      "timestamp": "1 hour ago",
      "text": "Thanks Sarah! I've scheduled the orientation session for tomorrow at 10 AM.",
      "isInternal": true
    }
  ],
  "success": true,
  "metadata": {
    "totalCount": 2,
    "hasMore": false
  }
}
```

### POST /tickets/:ticketId/comments
**Description:** Add a new comment to a ticket

**Request:**
```json
{
  "text": "Looking forward to starting! I have a question about parking arrangements.",
  "isInternal": false
}
```

**Response:**
```json
{
  "data": {
    "id": 3,
    "author": "John Smith",
    "timestamp": "Just now",
    "text": "Looking forward to starting! I have a question about parking arrangements.",
    "isInternal": false
  },
  "success": true,
  "message": "Comment added successfully"
}
```

### PUT /tickets/:ticketId/comments/:commentId
**Description:** Update an existing comment

**Request:**
```json
{
  "text": "Looking forward to starting! The parking question has been resolved."
}
```

**Response:**
```json
{
  "data": {
    "id": 3,
    "author": "John Smith",
    "timestamp": "Just now (edited)",
    "text": "Looking forward to starting! The parking question has been resolved.",
    "isInternal": false
  },
  "success": true
}
```

### DELETE /tickets/:ticketId/comments/:commentId
**Description:** Delete a comment

**Response:**
```json
{
  "data": true,
  "success": true,
  "message": "Comment deleted successfully"
}
```

### PATCH /tickets/:ticketId/comments/:commentId/visibility
**Description:** Toggle comment visibility (internal/external)

**Response:**
```json
{
  "data": {
    "id": 3,
    "author": "John Smith",
    "timestamp": "Just now",
    "text": "Internal note about the employee's concerns.",
    "isInternal": true
  },
  "success": true
}
```

### GET /tickets/:ticketId/comments/count
**Description:** Get comment count for a ticket

**Response:**
```json
{
  "data": {
    "total": 5,
    "internal": 2,
    "external": 3
  },
  "success": true
}
```

---

## History Management

### GET /tickets/:ticketId/history
**Description:** Retrieve history/activity log for a ticket

**Query Parameters:**
- `limit` (number): Limit number of history items (default: 50)
- `offset` (number): Offset for pagination (default: 0)
- `actionType` (string): Filter by action type

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "ticketId": "TICK-2024-001",
      "action": "Ticket Created",
      "actor": "John Doe",
      "timestamp": "Jan 15 10:30 AM",
      "details": "Employee onboarding ticket created for John Smith. Assigned category: HR, Priority: Medium"
    },
    {
      "id": 2,
      "ticketId": "TICK-2024-001",
      "action": "Assigned",
      "actor": "System",
      "timestamp": "Jan 15 10:31 AM",
      "details": "Auto-assigned to Jane Smith based on workload distribution"
    },
    {
      "id": 3,
      "ticketId": "TICK-2024-001",
      "action": "Status Updated",
      "actor": "Jane Smith",
      "timestamp": "Jan 16 9:00 AM",
      "details": "Status changed from New to In Progress"
    }
  ],
  "success": true,
  "metadata": {
    "totalCount": 12,
    "hasMore": true
  }
}
```

### POST /tickets/:ticketId/history
**Description:** Add a history entry (system-generated or manual)

**Request:**
```json
{
  "action": "Equipment Requested",
  "actor": "Mike Chen",
  "details": "IT equipment request submitted: MacBook Pro 16\", external monitor"
}
```

**Response:**
```json
{
  "data": {
    "id": 13,
    "ticketId": "TICK-2024-001",
    "action": "Equipment Requested",
    "actor": "Mike Chen",
    "timestamp": "Jan 17 3:45 PM",
    "details": "IT equipment request submitted: MacBook Pro 16\", external monitor"
  },
  "success": true
}
```

### GET /tickets/:ticketId/history/count
**Description:** Get history count for a ticket

**Response:**
```json
{
  "data": 12,
  "success": true
}
```

---

## User Management

### GET /users/current
**Description:** Get current authenticated user

**Response:**
```json
{
  "data": {
    "id": "user_001",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "avatar": "https://api.example.com/avatars/user_001.jpg",
    "roles": ["user", "agent"],
    "department": "Engineering",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "success": true
}
```

### GET /users/:userId
**Description:** Get user by ID

### GET /users
**Description:** List users (for assignment, etc.)

**Query Parameters:**
- `department` (string): Filter by department
- `role` (string): Filter by role
- `active` (boolean): Filter by active status
- `search` (string): Search by name or email

---

## Error Handling

### Standard Error Response
```json
{
  "data": null,
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "code": "INVALID_EMAIL",
      "message": "Please enter a valid email address"
    },
    {
      "field": "phone_number",
      "code": "REQUIRED_FIELD",
      "message": "Phone number is required"
    }
  ],
  "metadata": {
    "timestamp": "2024-01-28T10:30:00Z",
    "requestId": "req_001"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST requests |
| 204 | No Content | Successful DELETE requests |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (version mismatch) |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server-side errors |
| 503 | Service Unavailable | Service temporarily down |

---

## Data Models

### Core Types

#### UUID
```typescript
type UUID = string; // e.g., "user_001", "TICK-2024-001"
```

#### Timestamp
```typescript
type Timestamp = string; // ISO 8601 format: "2024-01-28T10:30:00Z"
```

#### JsonValue
```typescript
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
```

### Ticket Model
```typescript
interface Ticket {
  // Base entity fields
  id: UUID;
  createdAt: Timestamp;
  createdBy: UUID;
  updatedAt?: Timestamp;
  updatedBy?: UUID;
  version: number;
  isDeleted?: boolean;
  
  // Ticket-specific fields
  ticketNumber: string;
  title: string;
  description?: string;
  status: 'new' | 'assigned' | 'in_progress' | 'manual_review' | 'completed' | 'failed';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  type: TicketType;
  category?: string;
  subcategory?: string;
  
  // People and assignment
  createdByUser?: User;
  assignedTo?: User;
  assignedToId?: UUID;
  reporter?: User;
  
  // Important timestamps
  estimatedResolutionTime?: Timestamp;
  firstResponseAt?: Timestamp;
  lastResponseAt?: Timestamp;
  resolvedAt?: Timestamp;
  completedAt?: Timestamp;
  
  // Form data and attachments
  formData: FormSubmissionData;
  formSchemaId: UUID;
  formSchemaVersion: string;
  customFields?: { [fieldId: string]: JsonValue };
  labels?: string[];
}
```

### Form Schema Model
```typescript
interface FormSchema {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
}

interface FormSection {
  id: string;
  title: string;
  collapsible?: boolean;
  collapsed?: boolean;
  repeatable?: boolean;
  minRepeats?: number;
  maxRepeats?: number;
  fields: FormField[];
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea';
  default?: JsonValue;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  validators?: FieldValidator[];
  options?: FieldOption[];
  attributes?: { [key: string]: any };
}

interface FieldValidator {
  name: 'required' | 'email' | 'min' | 'max' | 'minlength' | 'maxlength';
  message?: string;
  args?: number | string;
}

interface FieldOption {
  value: JsonValue;
  label: string;
  disabled?: boolean;
}
```

### Comment Model
```typescript
interface Comment {
  id: string | number;
  author: string;
  timestamp: string; // Human-readable: "2 hours ago", "Jan 15 10:30 AM"
  text: string;
  isInternal: boolean;
}
```

### History Model
```typescript
interface HistoryItem {
  id: number | string;
  ticketId?: string;
  action: string; // "Ticket Created", "Status Updated", etc.
  actor: string;  // "John Doe", "System"
  timestamp: string; // Human-readable: "Jan 15 10:30 AM"
  details?: string;
}
```

### User Model
```typescript
interface User {
  id: UUID;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}
```

---

## WebSocket Events (Optional)

For real-time updates, the application can connect to WebSocket endpoints:

### Connection
```
wss://api.ticketflow.com/v1/ws?token=<JWT_TOKEN>
```

### Event Types
```typescript
interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: Timestamp;
  id: UUID;
}

interface TicketUpdateEvent {
  ticketId: UUID;
  eventType: 'updated' | 'commented' | 'status_changed' | 'assigned';
  data: any;
  actor: {
    id: UUID;
    name: string;
  };
}
```

### Example Events
```json
{
  "type": "ticket_updated",
  "payload": {
    "ticketId": "TICK-2024-001",
    "eventType": "status_changed",
    "data": {
      "oldStatus": "new",
      "newStatus": "in_progress"
    },
    "actor": {
      "id": "user_002",
      "name": "Jane Smith"
    }
  },
  "timestamp": "2024-01-28T10:30:00Z",
  "id": "event_001"
}
```

---

## Implementation Notes

1. **Authentication**: All endpoints require JWT token in Authorization header
2. **Pagination**: Use `limit` and `offset` query parameters for list endpoints
3. **Versioning**: Include API version in URL (`/v1/`)
4. **Rate Limiting**: Implement rate limiting (e.g., 1000 requests per hour per user)
5. **Caching**: Consider caching for form schemas and user data
6. **File Uploads**: Implement separate endpoints for file attachments
7. **Search**: Add search endpoints for tickets with filtering capabilities
8. **Audit Logging**: Log all API actions for compliance and debugging
9. **Validation**: Server-side validation should match form schema validators
10. **Error Handling**: Provide detailed, actionable error messages

This API specification provides a complete foundation for implementing the backend services required by the TicketFlow application.
