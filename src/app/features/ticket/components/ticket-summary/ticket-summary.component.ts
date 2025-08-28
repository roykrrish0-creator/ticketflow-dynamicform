import { Component, Input, ChangeDetectionStrategy, OnInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';

import { Ticket } from '../../../../shared/models/ticket.interface';
import { TicketService } from '../../../../shared/services/ticket.service';
import { UtilsService } from '../../../../shared/services/utils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ticket-summary',
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatListModule
  ],
  templateUrl: './ticket-summary.component.html',
  styleUrl: './ticket-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketSummaryComponent implements OnInit {
  @Input() ticket?: Ticket;
  @Input() ticketId?: string;

  // Inject services using modern Angular patterns
  private readonly ticketService = inject(TicketService);
  public readonly utilsService = inject(UtilsService);
  private readonly route = inject(ActivatedRoute);

  // Signal for reactive ticket data
  ticketSignal = signal<Ticket | undefined>(undefined);

  // Computed properties for reactive display data
  priorityLabel = computed(() => {
    const ticket = this.ticketSignal();
    return ticket ? this.utilsService.getPriorityLabel(ticket.priority) : '';
  });

  statusLabel = computed(() => {
    const ticket = this.ticketSignal();
    return ticket ? this.utilsService.getStatusLabel(ticket.status) : '';
  });

  processName = computed(() => {
    const ticket = this.ticketSignal();
    return ticket ? this.utilsService.getProcessName(ticket.type) : '';
  });

  clientName = computed(() => {
    const ticket = this.ticketSignal();
    if (!ticket) return '';
    
    // Use the direct client property from customFields
    if (ticket.customFields?.['client']) {
      return String(ticket.customFields['client']);
    }
    
    return 'N/A';
  });

  reporterName = computed(() => {
    const ticket = this.ticketSignal();
    if (!ticket) return '';
    
    // Use the direct reporter property from the ticket
    if (ticket.reporter?.name && ticket.reporter.name.trim()) {
      return ticket.reporter.name;
    }
    
    // Fallback to display name if name is not available
    if (ticket.reporter?.displayName && ticket.reporter.displayName.trim()) {
      return ticket.reporter.displayName;
    }
    
    // Final fallback to default reporter
    return 'N/A';
  });

  subCategory = computed(() => {
    const ticket = this.ticketSignal();
    if (!ticket) return '';
    
    // Use the direct subcategory property from the ticket
    if (ticket.subcategory && ticket.subcategory.trim()) {
      return ticket.subcategory;
    }
    
    // Fallback: Default based on ticket type if no subcategory is set
    const typeKey = typeof ticket.type === 'string' ? ticket.type : ticket.type?.name || 'unknown';
    return typeKey === 'employee_onboarding' ? 'New Hire' : 'General';
  });

  ticketAge = computed(() => {
    const ticket = this.ticketSignal();
    return ticket ? this.utilsService.getTicketAge(ticket) : '';
  });

  // Computed properties for UI styling
  statusIcon = computed(() => {
    const ticket = this.ticketSignal();
    return ticket ? this.utilsService.getStatusIcon(ticket.status) : 'help';
  });

  statusColorClass = computed(() => {
    const ticket = this.ticketSignal();
    return ticket ? this.utilsService.getStatusColorClass(ticket.status) : '';
  });

  priorityColorClass = computed(() => {
    const ticket = this.ticketSignal();
    return ticket ? this.utilsService.getPriorityColorClass(ticket.priority) : '';
  });

  constructor() {
    // Effect to update ticket signal when Input changes
    effect(() => {
      if (this.ticket) {
        this.ticketSignal.set(this.ticket);
      }
    });
  }

  ngOnInit(): void {
    // Load ticket data if ticketId is provided but no ticket object
    if (this.ticketId && !this.ticket) {
      this.loadTicketData(this.ticketId);
    } else if (!this.ticket && !this.ticketId) {
      // Try to get ticketId from route parameters
      const routeTicketId = this.route.snapshot.paramMap.get('id');
      if (routeTicketId) {
        this.loadTicketData(routeTicketId);
      }
    }
  }

  /**
   * Load ticket data using TicketService
   */
  private loadTicketData(ticketId: string): void {
    this.ticketService.getTicketById(ticketId).subscribe({
      next: (ticket: Ticket) => {
        this.ticket = ticket;
        this.ticketSignal.set(ticket);
      },
      error: (error: any) => {
        console.error('Error loading ticket:', error);
      }
    });
  }


}
