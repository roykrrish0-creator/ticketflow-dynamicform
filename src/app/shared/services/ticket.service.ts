import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError, EMPTY } from 'rxjs';
import { map, catchError, tap, delay, startWith, filter } from 'rxjs/operators';
import { Ticket, FormSchema, FormSubmissionData } from '../models';
import { MockDataService } from './mock-data.service';

/**
 * TicketService - Dedicated service for handling all ticket-related operations
 * 
 * This service manages ticket CRUD operations, validation, and business logic.
 * It uses MockDataService only for fetching mock data and handles all data manipulation internally.
 */
@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private mockDataService = inject(MockDataService);
  
  // State management for tickets
  private ticketsState = new Map<string, BehaviorSubject<Ticket>>();
  private formSchemasState = new Map<string, BehaviorSubject<FormSchema>>();
  
  /**
   * Get ticket by ID with reactive updates
   * @param ticketId - The ticket ID
   * @returns Observable of ticket
   */
  getTicketById(ticketId: string): Observable<Ticket> {
    if (!this.ticketsState.has(ticketId)) {
      const initialTicket$ = new BehaviorSubject<Ticket | null>(null);
      this.ticketsState.set(ticketId, initialTicket$ as BehaviorSubject<Ticket>);
      
      // Load ticket from mock data service
      this.loadTicketFromMock(ticketId).subscribe(ticket => {
        initialTicket$.next(ticket);
      });
    }
    
    return this.ticketsState.get(ticketId)!.asObservable().pipe(
      map(ticket => ticket as Ticket)
    );
  }
  
  /**
   * Get form schema by ID
   * @param schemaId - The schema ID
   * @returns Observable of form schema
   */
  getFormSchema(schemaId: string): Observable<FormSchema> {
    if (!this.formSchemasState.has(schemaId)) {
      const initialSchema$ = new BehaviorSubject<FormSchema | null>(null);
      this.formSchemasState.set(schemaId, initialSchema$ as BehaviorSubject<FormSchema>);
      
      // Load schema from mock data service
      this.loadFormSchemaFromMock(schemaId).subscribe(schema => {
        initialSchema$.next(schema);
      });
    }
    
    return this.formSchemasState.get(schemaId)!.asObservable().pipe(
      map(schema => schema as FormSchema)
    );
  }
  
  /**
   * Save ticket data
   * @param ticketId - The ticket ID
   * @param formData - The form data to save
   * @returns Observable of updated ticket
   */
  saveTicket(ticketId: string, formData: FormSubmissionData): Observable<Ticket> {
    // Get current ticket
    const ticketSubject = this.ticketsState.get(ticketId);
    if (!ticketSubject || !ticketSubject.value) {
      return throwError(() => new Error('Ticket not found'));
    }
    
    const currentTicket = ticketSubject.value;
    
    // Create updated ticket
    const updatedTicket: Ticket = {
      ...currentTicket,
      formData: formData,
      updatedAt: new Date(),
      version: currentTicket.version + 1
    };
    
    // Simulate API delay and save
    return of(updatedTicket).pipe(
      delay(1000),
      tap(ticket => {
        // Update local state
        ticketSubject.next(ticket);
      }),
      catchError(error => {
        console.error('Failed to save ticket:', error);
        return throwError(() => new Error('Failed to save ticket. Please try again.'));
      })
    );
  }
  
  /**
   * Save ticket as draft
   * @param ticketId - The ticket ID
   * @param formData - The form data to save as draft
   * @returns Observable of success
   */
  saveDraft(ticketId: string, formData: FormSubmissionData): Observable<void> {
    // Get current ticket
    const ticketSubject = this.ticketsState.get(ticketId);
    if (!ticketSubject || !ticketSubject.value) {
      return throwError(() => new Error('Ticket not found'));
    }
    
    const currentTicket = ticketSubject.value;
    
    // Create draft update (without incrementing version)
    const draftTicket: Ticket = {
      ...currentTicket,
      formData: formData,
      updatedAt: new Date()
    };
    
    // Simulate API delay and save draft
    return of(void 0).pipe(
      delay(500),
      tap(() => {
        // Update local state
        ticketSubject.next(draftTicket);
      }),
      catchError(error => {
        console.error('Failed to save draft:', error);
        return of(void 0); // Don't fail on draft save errors
      })
    );
  }
  
  /**
   * Create a new ticket
   * @param ticketData - Partial ticket data
   * @returns Observable of created ticket
   */
  createTicket(ticketData: Partial<Ticket>): Observable<Ticket> {
    // Use MockDataService to create ticket with proper structure
    const newTicket = this.mockDataService.createNewTicket(ticketData);
    
    // Simulate API delay and create
    return of(newTicket).pipe(
      delay(800),
      tap(ticket => {
        // Add to local state
        const ticketSubject = new BehaviorSubject<Ticket>(ticket);
        this.ticketsState.set(ticket.id, ticketSubject);
      }),
      catchError(error => {
        console.error('Failed to create ticket:', error);
        return throwError(() => new Error('Failed to create ticket. Please try again.'));
      })
    );
  }
  
  /**
   * Update ticket status
   * @param ticketId - The ticket ID
   * @param newStatus - The new status
   * @returns Observable of updated ticket
   */
  updateTicketStatus(ticketId: string, newStatus: string): Observable<Ticket> {
    const ticketSubject = this.ticketsState.get(ticketId);
    if (!ticketSubject || !ticketSubject.value) {
      return throwError(() => new Error('Ticket not found'));
    }
    
    const currentTicket = ticketSubject.value;
    const updatedTicket: Ticket = {
      ...currentTicket,
      status: newStatus as any,
      updatedAt: new Date(),
      version: currentTicket.version + 1
    };
    
    return of(updatedTicket).pipe(
      delay(500),
      tap(ticket => {
        ticketSubject.next(ticket);
      }),
      catchError(error => {
        console.error('Failed to update ticket status:', error);
        return throwError(() => new Error('Failed to update ticket status. Please try again.'));
      })
    );
  }
  
  /**
   * Update ticket assignment
   * @param ticketId - The ticket ID
   * @param assigneeId - The new assignee ID
   * @returns Observable of updated ticket
   */
  updateTicketAssignment(ticketId: string, assigneeId: string): Observable<Ticket> {
    const ticketSubject = this.ticketsState.get(ticketId);
    if (!ticketSubject || !ticketSubject.value) {
      return throwError(() => new Error('Ticket not found'));
    }
    
    const currentTicket = ticketSubject.value;
    const updatedTicket: Ticket = {
      ...currentTicket,
      assignedToId: assigneeId,
      updatedAt: new Date(),
      version: currentTicket.version + 1
    };
    
    return of(updatedTicket).pipe(
      delay(500),
      tap(ticket => {
        ticketSubject.next(ticket);
      }),
      catchError(error => {
        console.error('Failed to update ticket assignment:', error);
        return throwError(() => new Error('Failed to update ticket assignment. Please try again.'));
      })
    );
  }
  
  /**
   * Delete ticket
   * @param ticketId - The ticket ID
   * @returns Observable of success
   */
  deleteTicket(ticketId: string): Observable<boolean> {
    const ticketSubject = this.ticketsState.get(ticketId);
    if (!ticketSubject || !ticketSubject.value) {
      return throwError(() => new Error('Ticket not found'));
    }
    
    return of(true).pipe(
      delay(500),
      tap(() => {
        // Remove from local state
        ticketSubject.complete();
        this.ticketsState.delete(ticketId);
      }),
      catchError(error => {
        console.error('Failed to delete ticket:', error);
        return throwError(() => new Error('Failed to delete ticket. Please try again.'));
      })
    );
  }
  
  /**
   * Clear ticket cache
   * @param ticketId - The ticket ID
   */
  clearTicketCache(ticketId: string): void {
    const ticketSubject = this.ticketsState.get(ticketId);
    if (ticketSubject) {
      ticketSubject.complete();
      this.ticketsState.delete(ticketId);
    }
  }
  
  /**
   * Clear form schema cache
   * @param schemaId - The schema ID
   */
  clearFormSchemaCache(schemaId: string): void {
    const schemaSubject = this.formSchemasState.get(schemaId);
    if (schemaSubject) {
      schemaSubject.complete();
      this.formSchemasState.delete(schemaId);
    }
  }
  
  /**
   * Clear all caches
   */
  clearAllCache(): void {
    this.ticketsState.forEach(subject => subject.complete());
    this.ticketsState.clear();
    
    this.formSchemasState.forEach(subject => subject.complete());
    this.formSchemasState.clear();
  }
  
  // === PRIVATE HELPER METHODS ===
  
  /**
   * Load ticket from mock data service
   */
  private loadTicketFromMock(ticketId: string): Observable<Ticket> {
    return this.mockDataService.getTicketData(ticketId).pipe(
      catchError(error => {
        console.error('Failed to load ticket from mock service:', error);
        return throwError(() => new Error('Failed to load ticket'));
      })
    );
  }
  
  /**
   * Load form schema from mock data service
   */
  private loadFormSchemaFromMock(schemaId: string): Observable<FormSchema> {
    return this.mockDataService.getFormSchemaData(schemaId).pipe(
      catchError(error => {
        console.error('Failed to load form schema from mock service:', error);
        return throwError(() => new Error('Failed to load form schema'));
      })
    );
  }
}
