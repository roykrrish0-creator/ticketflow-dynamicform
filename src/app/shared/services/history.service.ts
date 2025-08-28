import { Injectable, signal, inject } from '@angular/core';
import { Observable, of, BehaviorSubject, delay } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { HistoryItem, CreateHistoryItemRequest } from '../models/history.interface';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private mockDataService = inject(MockDataService);
  
  // State management for history per ticket
  private historyState = new Map<string, BehaviorSubject<HistoryItem[]>>();
  
  // Global history signal for backward compatibility
  private historyItems = signal<HistoryItem[]>([]);

  /**
   * Get history items for a specific ticket with reactive updates
   * @param ticketId - The ticket ID
   * @returns Observable of history items
   */
  getHistoryForTicket(ticketId: string): Observable<HistoryItem[]> {
    if (!this.historyState.has(ticketId)) {
      const initialHistory$ = new BehaviorSubject<HistoryItem[]>([]);
      this.historyState.set(ticketId, initialHistory$);
      
      // Load initial history from mock data service
      this.loadHistoryFromMock(ticketId).subscribe(historyItems => {
        initialHistory$.next(historyItems);
        // Also update global signal for backward compatibility
        this.historyItems.set(historyItems);
      });
    }
    
    return this.historyState.get(ticketId)!.asObservable();
  }

  /**
   * Add a new history item to a ticket
   * @param ticketId - The ticket ID
   * @param request - History item creation request
   * @returns Observable of the created history item
   */
  addHistoryItem(ticketId: string, request: CreateHistoryItemRequest): Observable<HistoryItem> {
    // Create new history item using mock data service
    const newItem = this.mockDataService.createNewHistoryItem(
      ticketId, 
      request.action, 
      request.actor, 
      request.details
    );
    
    // Simulate API delay and return the created item
    return of(newItem).pipe(
      delay(300),
      tap(item => {
        // Update local state
        this.addHistoryToState(ticketId, item);
      }),
      catchError(error => {
        console.error('Failed to add history item:', error);
        return of(newItem); // Still return the item even if there's an error
      })
    );
  }

  /**
   * Get the current history items signal (for reactive updates)
   * This method is kept for backward compatibility
   */
  getHistorySignal() {
    return this.historyItems.asReadonly();
  }

  /**
   * Get the count of history items for a ticket
   * @param ticketId - The ticket ID
   * @returns Observable of history count
   */
  getHistoryCount(ticketId: string): Observable<number> {
    return this.getHistoryForTicket(ticketId).pipe(
      map(items => items.length)
    );
  }
  
  /**
   * Get the count of history items (global signal - for backward compatibility)
   */
  getHistoryCountSync(): number {
    return this.historyItems().length;
  }
  
  /**
   * Clear history cache for a ticket
   * @param ticketId - The ticket ID
   */
  clearHistoryCache(ticketId: string): void {
    const historySubject = this.historyState.get(ticketId);
    if (historySubject) {
      historySubject.complete();
      this.historyState.delete(ticketId);
    }
  }
  
  /**
   * Clear all history cache
   */
  clearAllHistoryCache(): void {
    this.historyState.forEach(subject => subject.complete());
    this.historyState.clear();
    this.historyItems.set([]);
  }
  
  // === PRIVATE HELPER METHODS ===
  
  /**
   * Load history from mock data service
   */
  private loadHistoryFromMock(ticketId: string): Observable<HistoryItem[]> {
    return this.mockDataService.getHistoryData(ticketId).pipe(
      catchError(error => {
        console.error('Failed to load history from mock service:', error);
        return of([]); // Return empty array on error
      })
    );
  }
  
  /**
   * Add history item to local state
   */
  private addHistoryToState(ticketId: string, newItem: HistoryItem): void {
    const historySubject = this.historyState.get(ticketId);
    if (historySubject) {
      const currentHistory = historySubject.value;
      // Add new item at the beginning (most recent first)
      const updatedHistory = [newItem, ...currentHistory];
      historySubject.next(updatedHistory);
      
      // Update global signal for backward compatibility
      this.historyItems.set(updatedHistory);
    }
  }
}
