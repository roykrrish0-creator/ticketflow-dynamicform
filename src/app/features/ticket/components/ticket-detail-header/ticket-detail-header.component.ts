import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';

import { Ticket } from '../../../../shared/models/ticket.interface';

@Component({
  selector: 'app-ticket-detail-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <header class="ticket-header" role="banner">
      <!-- Breadcrumb Navigation -->
      <nav class="breadcrumb-nav" aria-label="Breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <a routerLink="/tickets" class="breadcrumb-link">
              <mat-icon class="breadcrumb-icon">arrow_back</mat-icon>
              <span>Tickets</span>
            </a>
          </li>
          <li class="breadcrumb-item">
            <span class="breadcrumb-separator">/</span>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            <span>{{ ticket?.id || 'Loading...' }}</span>
          </li>
        </ol>
      </nav>

      <!-- Header Content -->
      <div class="header-content">
        <div class="header-left">
          <!-- Title and Status -->
          <div class="header-title-section">
            <h1 class="header-title">
              <span class="title-text">{{ title || ticket?.title || 'Untitled Ticket' }}</span>
              <span class="ticket-id">#{{ ticket?.id }}</span>
            </h1>
            <div class="header-meta">
              <span class="meta-item">
                <mat-icon class="meta-icon">calendar_today</mat-icon>
                {{ ticket?.createdAt | date:'MMM dd, yyyy' }}
              </span>
              <span class="meta-separator">•</span>
              <span class="meta-item">
                <mat-icon class="meta-icon">person</mat-icon>
                {{ ticket?.createdByUser?.name || 'Unknown User' }}
              </span>
              <span class="meta-separator">•</span>
              <div class="status-pill" [ngClass]="'status-' + ticket?.status">
                <mat-icon class="status-icon">{{ getStatusIcon(ticket?.status) }}</mat-icon>
                <span>{{ getStatusLabel(ticket?.status) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="header-actions">
          <!-- Cancel Button -->
          <button
            mat-stroked-button
            class="header-action-btn cancel"
            (click)="onCancel.emit()"
            [attr.aria-label]="'Cancel changes to ticket ' + ticket?.id">
            <mat-icon>close</mat-icon>
            <span class="btn-text">Cancel</span>
          </button>

          <!-- Reassign Button -->
          <button
            mat-raised-button
            class="header-action-btn reassign"
            (click)="onReassign.emit()"
            [attr.aria-label]="'Reassign ticket ' + ticket?.id">
            <mat-icon>person_add</mat-icon>
            <span class="btn-text">Reassign</span>
          </button>

          <!-- Primary Save Action -->
          <button
            mat-raised-button
            color="primary"
            class="header-action-btn primary"
            [disabled]="!canSave || isSaving"
            (click)="onSave.emit()"
            [attr.aria-label]="'Save changes to ticket ' + ticket?.id">
            <mat-icon *ngIf="!isSaving">save</mat-icon>
            <mat-icon *ngIf="isSaving" class="spinning">hourglass_empty</mat-icon>
            <span class="btn-text">{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styleUrl: './ticket-detail-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketDetailHeaderComponent {
  @Input() ticket?: Ticket;
  @Input() title?: string;
  @Input() canSave: boolean = false;
  @Input() isSaving: boolean = false;

  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();
  @Output() onReassign = new EventEmitter<void>();

  /**
   * Get status icon based on ticket status
   */
  getStatusIcon(status?: string): string {
    switch (status) {
      case 'open':
        return 'radio_button_unchecked';
      case 'in_progress':
        return 'schedule';
      case 'pending':
        return 'pause_circle';
      case 'resolved':
        return 'check_circle';
      case 'closed':
        return 'check_circle_outline';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help_outline';
    }
  }

  /**
   * Get formatted status label
   */
  getStatusLabel(status?: string): string {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }
}
