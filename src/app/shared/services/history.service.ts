import { Injectable, signal } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { HistoryItem, CreateHistoryItemRequest } from '../models/history.interface';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private historyItems = signal<HistoryItem[]>([
    {
      id: 1,
      action: 'Ticket Created',
      actor: 'Jane Doe',
      timestamp: 'Jan 15, 2024, 10:00 AM',
      details: 'Employee onboarding request submitted for John Smith'
    },
    {
      id: 2,
      action: 'Assigned to Mike Chen',
      actor: 'System',
      timestamp: 'Jan 15, 2024, 10:05 AM',
      details: 'Ticket automatically assigned based on workload and expertise'
    },
    {
      id: 3,
      action: 'Status changed to On Track',
      actor: 'Mike Chen',
      timestamp: 'Jan 16, 2024, 9:30 AM',
      details: 'Initial review completed, proceeding with onboarding checklist'
    },
    {
      id: 4,
      action: 'Documents Uploaded',
      actor: 'Sarah Johnson',
      timestamp: 'Jan 16, 2024, 2:15 PM',
      details: 'Employment contract and handbook uploaded to employee portal'
    }
  ]);

  /**
   * Get history items for a specific ticket
   */
  getHistoryForTicket(ticketId: string): Observable<HistoryItem[]> {
    // In a real implementation, this would filter by ticketId
    // For now, return all mock history items
    return of(this.historyItems());
  }

  /**
   * Add a new history item
   */
  addHistoryItem(ticketId: string, request: CreateHistoryItemRequest): Observable<HistoryItem> {
    const newItem: HistoryItem = {
      id: this.historyItems().length + 1,
      action: request.action,
      actor: request.actor,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      details: request.details
    };

    // Add to the beginning of the array (most recent first)
    this.historyItems.update(items => [newItem, ...items]);
    
    return of(newItem);
  }

  /**
   * Get the current history items signal (for reactive updates)
   */
  getHistorySignal() {
    return this.historyItems.asReadonly();
  }

  /**
   * Get the count of history items
   */
  getHistoryCount(): number {
    return this.historyItems().length;
  }
}
