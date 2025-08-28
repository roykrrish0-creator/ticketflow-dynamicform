import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { Ticket } from '../../../../shared/models/ticket.interface';
import { TicketService } from '../../../../shared/services/ticket.service';
import { UtilsService } from '../../../../shared/services/utils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ticket-header',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './ticket-header.component.html',
  styleUrl: './ticket-header.component.scss'
})
export class TicketHeaderComponent implements OnInit {
  @Input() ticketId?: string;
  @Input() isEditMode: boolean = false;
  @Input() canSave: boolean = false;
  @Input() isSaving: boolean = false;

  @Output() reassign = new EventEmitter<void>();
  @Output() enterEditMode = new EventEmitter<void>();
  @Output() saveChanges = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // Inject services
  private readonly ticketService = inject(TicketService);
  private readonly utilsService = inject(UtilsService);
  private readonly route = inject(ActivatedRoute);

  // Signals for reactive data
  ticketSignal = signal<Ticket | undefined>(undefined);

  // Computed properties from ticket data
  title = computed(() => {
    const ticket = this.ticketSignal();
    return ticket?.title || ticket?.description || 'Employee Onboarding';
  });

  statusLabel = computed(() => {
    const ticket = this.ticketSignal();
    return ticket ? this.utilsService.getStatusLabel(ticket.status) : 'Unknown';
  });

  statusClass = computed(() => {
    const ticket = this.ticketSignal();
    return ticket ? this.utilsService.getStatusColorClass(ticket.status) : '';
  });

   statusIcon = computed(() => {
    const ticket = this.ticketSignal();
    return ticket ? this.utilsService.getStatusIcon(ticket.status) : 'help';
  });

  createdDate = computed(() => {
    const ticket = this.ticketSignal();
    if (!ticket?.createdAt) return 'Unknown date';
    
    try {
      const date = new Date(ticket.createdAt);
      return `Created ${date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}`;
    } catch {
      return 'Unknown date';
    }
  });

  ngOnInit(): void {
    // Load ticket data if ticketId is provided
    if (this.ticketId) {
      this.loadTicketData(this.ticketId);
    } else {
      // Try to get ticketId from route parameters
      const routeTicketId = this.route.snapshot.paramMap.get('id');
      if (routeTicketId) {
        this.loadTicketData(routeTicketId);
      }
    }
  }

  private loadTicketData(ticketId: string): void {
    this.ticketService.getTicketById(ticketId).subscribe({
      next: (ticket: Ticket) => {
        this.ticketSignal.set(ticket);
      },
      error: (error: any) => {
        console.error('Error loading ticket for header:', error);
      }
    });
  }

  onReassign(): void {
    this.reassign.emit();
  }

  onEnterEditMode(): void {
    this.enterEditMode.emit();
  }

  onSaveChanges(): void {
    this.saveChanges.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
