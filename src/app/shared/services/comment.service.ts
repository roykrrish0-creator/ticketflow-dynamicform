import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';
import { Comment, CreateCommentRequest, CommentResponse } from '../models/comment.interface';
import { MockDataService } from './mock-data.service';

/**
 * CommentService - Dedicated service for handling all comment-related operations
 * 
 * This service manages comment CRUD operations, validation, and business logic.
 * It uses MockDataService only for fetching mock data and handles all data manipulation internally.
 */
@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private mockDataService = inject(MockDataService);
  
  // State management for comments per ticket
  private commentsState = new Map<string, BehaviorSubject<Comment[]>>();
  
  /**
   * Get comments for a specific ticket with reactive updates
   * @param ticketId - The ticket ID
   * @returns Observable of comment array
   */
  getComments(ticketId: string): Observable<Comment[]> {
    if (!this.commentsState.has(ticketId)) {
      const initialComments$ = new BehaviorSubject<Comment[]>([]);
      this.commentsState.set(ticketId, initialComments$);
      
      // Load initial comments from mock data service
      this.loadCommentsFromMock(ticketId).subscribe(comments => {
        initialComments$.next(comments);
      });
    }
    
    return this.commentsState.get(ticketId)!.asObservable();
  }
  
  /**
   * Get comments count for a ticket
   * @param ticketId - The ticket ID
   * @returns Observable of comment count
   */
  getCommentsCount(ticketId: string): Observable<number> {
    return this.getComments(ticketId).pipe(
      map(comments => comments.length)
    );
  }
  
  /**
   * Add a new comment to a ticket
   * @param request - Comment creation request
   * @returns Observable of the created comment
   */
  addComment(request: CreateCommentRequest): Observable<Comment> {
    // Validate comment text
    const validationResult = this.validateCommentText(request.text);
    if (!validationResult.isValid) {
      return throwError(() => new Error(validationResult.error!));
    }
    
    // Create new comment using mock data service (for mock data structure)
    const newComment = this.mockDataService.createCommentEntity(request.text, request.isInternal || false);
    
    // Simulate API delay and return the created comment
    return of(newComment).pipe(
      delay(500),
      tap(comment => {
        // Update local state
        this.addCommentToState(request.ticketId, comment);
      }),
      catchError(error => {
        console.error('Failed to add comment:', error);
        return throwError(() => new Error('Failed to add comment. Please try again.'));
      })
    );
  }
  
  /**
   * Update an existing comment
   * @param ticketId - The ticket ID
   * @param commentId - The comment ID to update
   * @param newText - The updated comment text
   * @returns Observable of the updated comment
   */
  updateComment(ticketId: string, commentId: string | number, newText: string): Observable<Comment> {
    // Validate comment text
    const validationResult = this.validateCommentText(newText);
    if (!validationResult.isValid) {
      return throwError(() => new Error(validationResult.error!));
    }
    
    const commentsSubject = this.commentsState.get(ticketId);
    if (!commentsSubject) {
      return throwError(() => new Error('Comments not loaded for this ticket'));
    }
    
    const currentComments = commentsSubject.value;
    const commentIndex = currentComments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
      return throwError(() => new Error('Comment not found'));
    }
    
    // Update the comment
    const updatedComment = {
      ...currentComments[commentIndex],
      text: newText,
      timestamp: 'Just now (edited)'
    };
    
    // Simulate API call with delay
    return of(updatedComment).pipe(
      tap(comment => {
        // Update local state
        const updatedComments = [...currentComments];
        updatedComments[commentIndex] = comment;
        commentsSubject.next(updatedComments);
      }),
      catchError(error => {
        console.error('Failed to update comment:', error);
        return throwError(() => new Error('Failed to update comment. Please try again.'));
      })
    );
  }
  
  /**
   * Delete a comment
   * @param ticketId - The ticket ID
   * @param commentId - The comment ID to delete
   * @returns Observable of success response
   */
  deleteComment(ticketId: string, commentId: string | number): Observable<boolean> {
    const commentsSubject = this.commentsState.get(ticketId);
    if (!commentsSubject) {
      return throwError(() => new Error('Comments not loaded for this ticket'));
    }
    
    const currentComments = commentsSubject.value;
    const commentExists = currentComments.some(c => c.id === commentId);
    
    if (!commentExists) {
      return throwError(() => new Error('Comment not found'));
    }
    
    // Simulate API call with delay
    return of(true).pipe(
      tap(() => {
        // Update local state by removing the comment
        const updatedComments = currentComments.filter(c => c.id !== commentId);
        commentsSubject.next(updatedComments);
      }),
      catchError(error => {
        console.error('Failed to delete comment:', error);
        return throwError(() => new Error('Failed to delete comment. Please try again.'));
      })
    );
  }
  
  /**
   * Toggle comment visibility (internal/external)
   * @param ticketId - The ticket ID
   * @param commentId - The comment ID
   * @returns Observable of the updated comment
   */
  toggleCommentVisibility(ticketId: string, commentId: string | number): Observable<Comment> {
    const commentsSubject = this.commentsState.get(ticketId);
    if (!commentsSubject) {
      return throwError(() => new Error('Comments not loaded for this ticket'));
    }
    
    const currentComments = commentsSubject.value;
    const commentIndex = currentComments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
      return throwError(() => new Error('Comment not found'));
    }
    
    // Toggle the visibility
    const updatedComment = {
      ...currentComments[commentIndex],
      isInternal: !currentComments[commentIndex].isInternal
    };
    
    // Simulate API call with delay
    return of(updatedComment).pipe(
      tap(comment => {
        // Update local state
        const updatedComments = [...currentComments];
        updatedComments[commentIndex] = comment;
        commentsSubject.next(updatedComments);
      }),
      catchError(error => {
        console.error('Failed to toggle comment visibility:', error);
        return throwError(() => new Error('Failed to update comment visibility. Please try again.'));
      })
    );
  }
  
  /**
   * Get filtered comments (internal/external)
   * @param ticketId - The ticket ID
   * @param showInternal - Whether to include internal comments
   * @returns Observable of filtered comments
   */
  getFilteredComments(ticketId: string, showInternal: boolean = true): Observable<Comment[]> {
    return this.getComments(ticketId).pipe(
      map(comments => {
        if (showInternal) {
          return comments; // Show all comments
        }
        return comments.filter(comment => !comment.isInternal); // Show only public comments
      })
    );
  }
  
  /**
   * Search comments by text
   * @param ticketId - The ticket ID
   * @param searchTerm - Search term
   * @returns Observable of matching comments
   */
  searchComments(ticketId: string, searchTerm: string): Observable<Comment[]> {
    if (!searchTerm.trim()) {
      return this.getComments(ticketId);
    }
    
    const term = searchTerm.toLowerCase().trim();
    return this.getComments(ticketId).pipe(
      map(comments => 
        comments.filter(comment => 
          comment.text.toLowerCase().includes(term) ||
          comment.author.toLowerCase().includes(term)
        )
      )
    );
  }
  
  /**
   * Clear comments state for a ticket (useful for cleanup)
   * @param ticketId - The ticket ID
   */
  clearCommentsCache(ticketId: string): void {
    const commentsSubject = this.commentsState.get(ticketId);
    if (commentsSubject) {
      commentsSubject.complete();
      this.commentsState.delete(ticketId);
    }
  }
  
  /**
   * Clear all comments state (useful for logout/cleanup)
   */
  clearAllCommentsCache(): void {
    this.commentsState.forEach((subject, ticketId) => {
      subject.complete();
    });
    this.commentsState.clear();
  }
  
  // === PRIVATE HELPER METHODS ===
  
  /**
   * Load comments from mock data service
   */
  private loadCommentsFromMock(ticketId: string): Observable<Comment[]> {
    return this.mockDataService.getCommentsData(ticketId).pipe(
      catchError(error => {
        console.error('Failed to load comments from mock service:', error);
        return of([]); // Return empty array on error
      })
    );
  }
  
  /**
   * Add comment to local state
   */
  private addCommentToState(ticketId: string, newComment: Comment): void {
    const commentsSubject = this.commentsState.get(ticketId);
    if (commentsSubject) {
      const currentComments = commentsSubject.value;
      // Add new comment at the beginning (most recent first)
      commentsSubject.next([newComment, ...currentComments]);
    }
  }
  
  /**
   * Validate comment text
   */
  private validateCommentText(text: string): { isValid: boolean; error?: string } {
    if (!text || typeof text !== 'string') {
      return { isValid: false, error: 'Comment text is required' };
    }
    
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return { isValid: false, error: 'Comment cannot be empty' };
    }
    
    if (trimmedText.length > 5000) {
      return { isValid: false, error: 'Comment cannot exceed 5000 characters' };
    }
    
    if (trimmedText.length < 2) {
      return { isValid: false, error: 'Comment must be at least 2 characters long' };
    }
    
    return { isValid: true };
  }
}
