# Skeleton Components

This directory contains a comprehensive skeleton loading component for the TicketFlow application. The skeleton provides visual feedback to users while data is being loaded, improving perceived performance and user experience.

## Available Components

### TicketDetailSkeletonComponent
A comprehensive skeleton loader that mimics the complete structure of the ticket detail page.

**Features:**
- **Header Section**: Back button, title, status chip, and action buttons
- **Form Section**: Expansion panels with the first section expanded showing 8 field placeholders
- **Summary Panel**: Key information items, progress bar, and tags
- **Tabs Section**: Comments and History tabs with placeholder content
- **Responsive Design**: Adapts to different screen sizes with proper grid layout
- **Accessibility Support**: Respects reduced motion preferences and high contrast mode
- **Theme Support**: Compatible with light and dark themes

**Usage:**
```html
<app-ticket-detail-skeleton></app-ticket-detail-skeleton>
```

## Integration Example

Here's how to integrate the skeleton component with proper loading state management:

```typescript
// ticket-detail.component.ts
import { TicketDetailSkeletonComponent } from '../../../../shared/components/skeleton/ticket-detail-skeleton.component';

@Component({
  selector: 'app-ticket-detail',
  imports: [
    // ... other imports
    TicketDetailSkeletonComponent
  ],
  // ...
})
export class TicketDetailComponent {
  // Loading state management
  get isAnyDataLoading(): boolean {
    return this.ticketOperation.isLoading || this.schemaOperation.isLoading;
  }

  get isMainDataLoaded(): boolean {
    return !this.ticketOperation.isLoading && !this.schemaOperation.isLoading && !!this.dynamicForm;
  }
}
```

```html
<!-- ticket-detail.component.html -->
<!-- Show skeleton while loading -->
@if (isAnyDataLoading && !hasLoadingErrors) {
  <app-ticket-detail-skeleton></app-ticket-detail-skeleton>
}

<!-- Show actual content when loaded -->
@if (isMainDataLoaded && !hasLoadingErrors) {
  <!-- Your actual ticket detail content -->
}
```

## Design Principles

### Animation
The skeleton component uses a subtle shimmer animation that:
- Moves from left to right using CSS transforms
- Has a duration of 1.5 seconds
- Uses a smooth ease-in-out timing function
- Can be disabled for users who prefer reduced motion

### Accessibility
- Respects `prefers-reduced-motion` for users with vestibular disorders
- Supports high contrast mode with appropriate color adjustments
- Maintains proper color contrast ratios
- Uses semantic HTML structure

### Responsive Design
- Mobile-first approach with thoughtful breakpoints
- Adapts layout for tablet and desktop sizes
- Maintains visual hierarchy across all screen sizes
- Grid layout adjusts based on viewport size

### Performance
- Uses efficient CSS animations with GPU acceleration
- OnPush change detection strategy for optimal performance
- Minimal DOM manipulation
- Optimized for tree-shaking

## Technical Implementation

### Loading State Management
The skeleton addresses the common issue with BehaviorSubject initial null emissions:

```typescript
// ✅ Proper implementation
private loadTicketData(): void {
  // Set loading state immediately
  this.ticketOperation = { isLoading: true };
  this.schemaOperation = { isLoading: true };
  this.cdr.detectChanges(); // Force change detection to show skeleton
  
  // Load data with proper null filtering
  this.ticketService.getTicketById(this.ticketId).pipe(
    filter((ticket): ticket is Ticket => ticket !== null), // Filter out null emissions
    takeUntil(this.destroy$)
  ).subscribe({
    next: (ticket) => {
      this.ticket = ticket;
      this.ticketOperation = { isLoading: false, data: ticket };
      this.cdr.detectChanges();
    },
    error: (error) => {
      this.ticketOperation = { isLoading: false, error };
      this.cdr.detectChanges();
    }
  });
}
```

### Subscription Lifecycle
```typescript
// ✅ Proper subscription management
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

// Use takeUntil for automatic unsubscription
this.dataService.getData().pipe(
  takeUntil(this.destroy$)
).subscribe(/* ... */);
```

## Customization

### Colors
You can customize the skeleton colors by overriding CSS variables:

```scss
:root {
  --skeleton-base-color: #f0f0f0;
  --skeleton-highlight-color: #e0e0e0;
  --skeleton-primary-color: #e3f2fd;
}

.dark-theme {
  --skeleton-base-color: #424242;
  --skeleton-highlight-color: #303030;
  --skeleton-primary-color: #1976d2;
}
```

### Animation Speed
```scss
.skeleton {
  animation-duration: 2s; // Slower animation
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: #e0e0e0;
  }
}
```

## File Structure

```
skeleton/
├── index.ts                                    # Export barrel
├── ticket-detail-skeleton.component.ts        # Main component
├── ticket-detail-skeleton.component.html      # Template
├── ticket-detail-skeleton.component.scss      # Styles and animations
├── ticket-detail-skeleton-integration-example.ts  # Integration examples
└── README.md                                   # Documentation
```

## Migration from Old Implementation

If you were previously using individual skeleton components:

```typescript
// ❌ Old approach
import {
  TicketHeaderSkeletonComponent,
  FormSectionSkeletonComponent,
  TicketSummarySkeletonComponent,
  TabsSkeletonComponent
} from '../../../../shared/components/skeleton';

// ✅ New approach
import { TicketDetailSkeletonComponent } from '../../../../shared/components/skeleton/ticket-detail-skeleton.component';
```

```html
<!-- ❌ Old template -->
<app-ticket-header-skeleton></app-ticket-header-skeleton>
<div class="layout">
  <app-form-section-skeleton></app-form-section-skeleton>
  <app-ticket-summary-skeleton></app-ticket-summary-skeleton>
</div>
<app-tabs-skeleton></app-tabs-skeleton>

<!-- ✅ New template -->
<app-ticket-detail-skeleton></app-ticket-detail-skeleton>
```

## Benefits of the New Approach

1. **Simplified Integration**: Single component replaces multiple skeleton components
2. **Consistent Layout**: Ensures skeleton matches actual content structure
3. **Better Performance**: Reduced component overhead and bundle size
4. **Easier Maintenance**: Single source of truth for skeleton styling
5. **Improved UX**: More accurate representation of final content

## Browser Support

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- CSS Grid and Flexbox support required
- CSS Animation support required for shimmer effect
- Graceful degradation for older browsers (static placeholders)
