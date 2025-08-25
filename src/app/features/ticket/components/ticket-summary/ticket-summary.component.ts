import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { Ticket } from '../../../../shared/models/ticket.interface';

@Component({
  selector: 'app-ticket-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  template: `
    <div class="ticket-summary-card" *ngIf="ticket">
      <!-- Card Header -->
      <div class="summary-header">
        <h3 class="summary-title">Ticket Summary</h3>
      </div>

      <!-- Status Badges -->
      <div class="status-badges">
        <!-- Status Badge -->
        <div class="status-badge" [ngClass]="'status-' + ticket.status.toLowerCase()">
          <mat-icon>schedule</mat-icon>
          {{ getStatusLabel(ticket.status) }}
        </div>
        
        <!-- Priority Badge -->
        <div class="priority-badge" [ngClass]="'priority-' + ticket.priority.toLowerCase()">
          {{ getPriorityLabel(ticket.priority) }}
        </div>
      </div>

      <!-- Summary Details -->
      <div class="summary-details">
        <!-- Assigned To -->
        <div class="detail-item">
          <div class="detail-label">Assigned To</div>
          <div class="detail-value">
            <div class="user-info" *ngIf="ticket.assignedTo; else unassigned">
              <div class="user-avatar" [style.background-color]="getAvatarColor(ticket.assignedTo.name)">
                {{ getInitials(ticket.assignedTo.name) }}
              </div>
              <span class="user-name">{{ ticket.assignedTo.name }}</span>
            </div>
            <ng-template #unassigned>
              <span class="unassigned-text">Unassigned</span>
            </ng-template>
          </div>
        </div>

        <!-- Reporter -->
        <div class="detail-item">
          <div class="detail-label">Reporter</div>
          <div class="detail-value">
            <div class="user-info" *ngIf="getReporter(ticket); else noReporter">
              <div class="user-avatar reporter-avatar">
                {{ getInitials(getReporter(ticket)) }}
              </div>
              <span class="user-name">{{ getReporter(ticket) }}</span>
            </div>
            <ng-template #noReporter>
              <span class="unassigned-text">Not specified</span>
            </ng-template>
          </div>
        </div>

        <!-- Ticket ID -->
        <div class="detail-item">
          <div class="detail-label">Ticket ID</div>
          <div class="detail-value ticket-id">
            #{{ ticket.id }}
          </div>
        </div>

        <!-- Client -->
        <div class="detail-item">
          <div class="detail-label">Client</div>
          <div class="detail-value">
            {{ getClientName(ticket) }}
          </div>
        </div>

        <!-- Type -->
        <div class="detail-item">
          <div class="detail-label">Type</div>
          <div class="detail-value">
            {{ getProcessName(ticket.type) }}
          </div>
        </div>

        <!-- Sub-Category -->
        <div class="detail-item">
          <div class="detail-label">Sub-Category</div>
          <div class="detail-value">
            {{ getSubCategory(ticket) }}
          </div>
        </div>

        <!-- Age -->
        <div class="detail-item">
          <div class="detail-label">Age</div>
          <div class="detail-value age-value">
            <div class="age-info">
              <mat-icon class="age-icon">schedule</mat-icon>
              <span class="age-duration">{{ getTicketAge(ticket) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './ticket-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketSummaryComponent {
  @Input() ticket?: Ticket;

  private readonly DEFAULT_CLIENT = 'Acme Corp';
  private readonly DEFAULT_REPORTER = 'Sarah Johnson';
  private readonly AVATAR_COLORS = [
    '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#6366f1'
  ];

  private readonly PRIORITY_LABELS: Record<string, string> = {
    'critical': 'Critical',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low'
  };

  private readonly STATUS_LABELS: Record<string, string> = {
    'open': 'Open',
    'in_progress': 'In Progress',
    'pending': 'Pending',
    'resolved': 'Resolved',
    'closed': 'Closed'
  };

  private readonly TYPE_LABELS: Record<string, string> = {
    'support_request': 'Support Request',
    'employee_onboarding': 'Onboarding',
    'bug_report': 'Bug Report',
    'feature_request': 'Feature Request'
  };

  /**
   * Get priority label
   */
  getPriorityLabel(priority: string): string {
    return this.PRIORITY_LABELS[priority] || 'Unknown';
  }

  /**
   * Get status label
   */
  getStatusLabel(status: string): string {
    return this.STATUS_LABELS[status.toLowerCase()] || 'In Progress';
  }

  /**
   * Get process name from ticket type
   */
  getProcessName(type: any): string {
    // Handle both string and TicketType object
    const typeKey = typeof type === 'string' ? type : type?.name || 'unknown';
    return this.TYPE_LABELS[typeKey] || 'General';
  }

  /**
   * Get user initials for avatar
   */
  getInitials(name: string): string {
    if (!name?.trim()) return '?';
    
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0]?.[0]?.toUpperCase() || '?';
  }

  /**
   * Get avatar color based on name
   */
  getAvatarColor(name: string): string {
    if (!name?.trim()) return this.AVATAR_COLORS[0];
    
    const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return this.AVATAR_COLORS[charCode % this.AVATAR_COLORS.length];
  }

  /**
   * Get client name from ticket
   */
  getClientName(ticket: Ticket): string {
    const formData = ticket.formData;
    
    if (formData) {
      // Check general_info section
      const generalInfo = formData['general_info'];
      if (this.isValidObject(generalInfo)) {
        const clientName = (generalInfo as Record<string, any>)['customer_name'];
        if (clientName) return clientName;
      }
      
      // Check basic_information section
      const basicInfo = formData['basic_information'];
      if (this.isValidObject(basicInfo)) {
        const clientName = (basicInfo as Record<string, any>)['client'];
        if (clientName) return clientName;
      }
    }
    
    // Check custom fields if they exist
    if (ticket.customFields?.['client']) {
      return String(ticket.customFields['client']);
    }
    
    return this.DEFAULT_CLIENT;
  }

  /**
   * Get reporter name
   */
  getReporter(ticket: Ticket): string {
    const formData = ticket.formData;
    
    if (formData) {
      // Check employee_details section
      const employeeDetails = formData['employee_details'];
      if (this.isValidObject(employeeDetails)) {
        const fullName = (employeeDetails as Record<string, any>)['full_name'];
        if (fullName) return fullName;
      }
      
      // Check basic_information section
      const basicInfo = formData['basic_information'];
      if (this.isValidObject(basicInfo)) {
        const reporterName = (basicInfo as Record<string, any>)['reporter'];
        if (reporterName) return reporterName;
      }
    }
    
    return this.DEFAULT_REPORTER;
  }

  /**
   * Get sub-category
   */
  getSubCategory(ticket: Ticket): string {
    const formData = ticket.formData;
    
    if (formData) {
      const basicInfo = formData['basic_information'];
      if (this.isValidObject(basicInfo)) {
        const subCategory = (basicInfo as Record<string, any>)['sub_category'];
        if (subCategory) return subCategory;
      }
    }
    
    // Default based on ticket type
    const typeKey = typeof ticket.type === 'string' ? ticket.type : ticket.type?.name || 'unknown';
    return typeKey === 'employee_onboarding' ? 'New Hire' : 'General';
  }

  /**
   * Get ticket age
   */
  getTicketAge(ticket: Ticket): string {
    const createdDate = new Date(ticket.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      const remainingHours = diffHours % 24;
      return `${diffDays}d ${remainingHours}h`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m`;
    }
  }

  /**
   * Check if value is a valid object (not null, not array)
   */
  private isValidObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
}
