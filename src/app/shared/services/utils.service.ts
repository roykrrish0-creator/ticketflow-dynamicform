/**
 * Utility Service
 * Lightweight utility functions for common operations
 * 
 * This service has been optimized to include only essential utilities.
 * Functions are added as needed to avoid bloating the codebase.
 */

import { Injectable } from '@angular/core';
import { UUID } from '../models/core.types';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  /**
   * Generate a UUID v4
   */
  generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Format a date to a readable string
   */
  formatDate(date: Date | string | null, format: string = 'MM/dd/yyyy'): string {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
      .replace('yyyy', year.toString())
      .replace('MM', month)
      .replace('dd', day);
  }

  /**
   * Get relative time string (e.g., "2 hours ago")
   */
  getRelativeTime(date: Date | string): string {
    if (!date) return '';
    
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }

  /**
   * Get user initials for avatar display
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
   * Get avatar background color based on name
   */
  getAvatarColor(name: string): string {
    const avatarColors = [
      '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#f97316', '#84cc16', '#6366f1'
    ];
    
    if (!name?.trim()) return avatarColors[0];
    
    const charCode = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return avatarColors[charCode % avatarColors.length];
  }

  /**
   * Get ticket age as formatted string
   */
  getTicketAge(ticket: { createdAt: Date | string }): string {
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
   * Get priority label for display
   */
  getPriorityLabel(priority: string): string {
    const priorityLabels: Record<string, string> = {
      'urgent': 'Urgent',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return priorityLabels[priority.toLowerCase()] || 'Unknown';
  }

  /**
   * Get status label for display
   */
  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'new': 'New',
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'manual_review': 'Manual Review',
      'completed': 'Completed',
      'failed': 'Failed'
    };
    return statusLabels[status.toLowerCase()] || 'In Progress';
  }

  /**
   * Get process name from ticket type
   */
  getProcessName(type: any): string {
    const typeLabels: Record<string, string> = {
      'support_request': 'Support Request',
      'employee_onboarding': 'Onboarding',
      'bug_report': 'Bug Report',
      'feature_request': 'Feature Request'
    };
    
    // Handle both string and TicketType object
    const typeKey = typeof type === 'string' ? type : type?.name || 'unknown';
    return typeLabels[typeKey] || 'General';
  }

  /**
   * Check if value is a valid object (not null, not array)
   */
  isValidObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Get status icon for Material Icons
   */
  getStatusIcon(status: string): string {
    const statusIcons: Record<string, string> = {
      'new': 'new_releases',
      'assigned': 'assignment_ind',
      'in_progress': 'hourglass_empty',
      'manual_review': 'fact_check',
      'completed': 'check_circle',
      'failed': 'error'
    };
    return statusIcons[status.toLowerCase()] || 'help';
  }

  /**
   * Get priority color class for styling
   */
  getPriorityColorClass(priority: string): string {
    const priorityClasses: Record<string, string> = {
      'urgent': 'priority-urgent',
      'high': 'priority-high', 
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return priorityClasses[priority.toLowerCase()] || 'priority-medium';
  }

  /**
   * Get status color class for styling
   */
  getStatusColorClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'new': 'status-new',
      'assigned': 'status-assigned',
      'in_progress': 'status-in-progress',
      'manual_review': 'status-manual-review',
      'completed': 'status-completed',
      'failed': 'status-failed'
    };
    return statusClasses[status.toLowerCase()] || 'status-in-progress';
  }
}
