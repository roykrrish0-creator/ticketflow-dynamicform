/**
 * Simplified History Model
 * Contains only the essential data needed for ticket history display
 */

/**
 * Simplified history item representing a single ticket activity
 */
export interface HistoryItem {
  id: number | string;
  ticketId?: string;     // Optional ticket ID for history items
  action: string;        // e.g., "Ticket Created", "Status changed to On Track"
  actor: string;         // e.g., "Jane Doe", "System"
  timestamp: string;     // e.g., "Jan 15, 2024, 10:00 AM"
  details?: string;      // Optional additional description
}

/**
 * Request interface for creating a new history item
 */
export interface CreateHistoryItemRequest {
  action: string;
  actor: string;
  details?: string;
}
