/**
 * Example Integration: Ticket Detail Component with Skeleton Loading
 * 
 * This example demonstrates how to integrate the ticket-detail-skeleton component
 * with proper loading state management, addressing the original issue with 
 * BehaviorSubject null emissions and subscription lifecycle.
 */

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { combineLatest, filter, map, startWith, Subject, takeUntil } from 'rxjs';

// Import the skeleton component
import { TicketDetailSkeletonComponent } from './ticket-detail-skeleton.component';

// Example ticket service (replace with your actual service)
interface TicketService {
  getTicketById(id: string): Observable<Ticket | null>;
  getFormSchema(ticketId: string): Observable<FormSchema | null>;
}

interface Ticket {
  id: string;
  title: string;
  status: string;
  // ... other ticket properties
}

interface FormSchema {
  sections: any[];
  // ... other schema properties
}

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    TicketDetailSkeletonComponent,
    // ... other imports for the actual ticket detail UI
  ],
  template: `
    <!-- Show skeleton while loading -->
    <app-ticket-detail-skeleton 
      *ngIf="isLoading$ | async; else contentTemplate">
    </app-ticket-detail-skeleton>

    <!-- Show actual content when loaded -->
    <ng-template #contentTemplate>
      <div class="ticket-detail-content" *ngIf="ticketData$ | async as ticket">
        <!-- Your actual ticket detail content here -->
        <h1>{{ ticket.title }}</h1>
        <!-- ... rest of your ticket detail template -->
      </div>
    </ng-template>
  `,
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  private readonly ticketService = inject(TicketService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  // Loading state observables
  public readonly ticketData$ = new Subject<Ticket | null>();
  public readonly formSchema$ = new Subject<FormSchema | null>();
  public readonly isLoading$ = new Subject<boolean>();

  ngOnInit(): void {
    this.loadTicketData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTicketData(): void {
    const ticketId = this.route.snapshot.paramMap.get('id');
    if (!ticketId) {
      return;
    }

    // Set loading to true immediately
    this.isLoading$.next(true);

    // Create loading observables with proper null filtering
    const ticket$ = this.ticketService.getTicketById(ticketId).pipe(
      filter((ticket): ticket is Ticket => ticket !== null),
      takeUntil(this.destroy$)
    );

    const formSchema$ = this.ticketService.getFormSchema(ticketId).pipe(
      filter((schema): schema is FormSchema => schema !== null),
      takeUntil(this.destroy$)
    );

    // Combine both observables and manage loading state
    combineLatest([
      ticket$,
      formSchema$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([ticket, formSchema]) => {
        // Both data sources have loaded successfully
        this.ticketData$.next(ticket);
        this.formSchema$.next(formSchema);
        this.isLoading$.next(false);
      },
      error: (error) => {
        console.error('Error loading ticket data:', error);
        this.isLoading$.next(false);
        // Handle error state here
      }
    });

    // Alternative approach: Subscribe to each observable separately
    // This approach gives you more granular control over loading states
    /*
    this.subscribeToTicketData(ticketId);
    this.subscribeToFormSchema(ticketId);
    */
  }

  /**
   * Alternative approach: Separate subscriptions with individual loading tracking
   */
  private subscribeToTicketData(ticketId: string): void {
    this.ticketService.getTicketById(ticketId).pipe(
      filter((ticket): ticket is Ticket => ticket !== null),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (ticket) => {
        this.ticketData$.next(ticket);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading ticket:', error);
        this.checkLoadingComplete();
      }
    });
  }

  private subscribeToFormSchema(ticketId: string): void {
    this.ticketService.getFormSchema(ticketId).pipe(
      filter((schema): schema is FormSchema => schema !== null),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (schema) => {
        this.formSchema$.next(schema);
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading form schema:', error);
        this.checkLoadingComplete();
      }
    });
  }

  private loadingStates = {
    ticket: true,
    formSchema: true
  };

  private checkLoadingComplete(): void {
    // Check if all required data has been loaded
    const allLoaded = Object.values(this.loadingStates).every(loaded => !loaded);
    this.isLoading$.next(!allLoaded);
  }

  /**
   * More advanced approach: Using a loading state management service
   */
  private loadTicketDataWithStateService(): void {
    // Example using a hypothetical loading state service
    /*
    const loadingKey = `ticket-${ticketId}`;
    
    this.loadingStateService.setLoading(loadingKey, true);
    
    combineLatest([
      this.ticketService.getTicketById(ticketId).pipe(filter(Boolean)),
      this.ticketService.getFormSchema(ticketId).pipe(filter(Boolean))
    ]).pipe(
      finalize(() => this.loadingStateService.setLoading(loadingKey, false)),
      takeUntil(this.destroy$)
    ).subscribe(([ticket, schema]) => {
      this.ticketData$.next(ticket);
      this.formSchema$.next(schema);
    });
    
    this.isLoading$ = this.loadingStateService.isLoading(loadingKey);
    */
  }
}

/**
 * Key Points for Implementation:
 * 
 * 1. **Filtering Null Emissions**: Use `filter(data => data !== null)` to ignore 
 *    initial BehaviorSubject null values
 * 
 * 2. **Loading State Management**: Set loading to true before starting requests,
 *    set to false only after actual data arrives
 * 
 * 3. **Proper Unsubscription**: Use takeUntil pattern to prevent memory leaks
 * 
 * 4. **Error Handling**: Always handle errors and ensure loading state is cleared
 * 
 * 5. **Combined Loading**: Use combineLatest when you need multiple data sources
 *    before showing content
 * 
 * 6. **Skeleton Display**: Show skeleton while isLoading$ is true, actual content
 *    when data is available
 */
