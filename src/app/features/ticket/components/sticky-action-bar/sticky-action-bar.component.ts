import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-sticky-action-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="sticky-action-bar" [class.has-validation-errors]="hasValidationErrors">
      <!-- Validation Summary -->
      <div class="validation-summary" *ngIf="hasValidationErrors" role="alert" aria-live="polite">
        <mat-icon class="warning-icon">warning</mat-icon>
        <span class="validation-text">{{ validationMessage || 'Please fix validation errors before saving' }}</span>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <!-- Secondary Actions (Left) -->
        <div class="secondary-actions">
          <button
            mat-stroked-button
            class="action-btn secondary"
            (click)="onCancel.emit()"
            [disabled]="isSaving"
            [attr.aria-label]="'Cancel changes'"
            type="button">
            <mat-icon>close</mat-icon>
            <span class="btn-text">Cancel</span>
          </button>

          <button
            mat-stroked-button
            class="action-btn secondary"
            (click)="onSaveDraft.emit()"
            [disabled]="!canSaveDraft || isSaving"
            [attr.aria-label]="isDraftSaving ? 'Saving draft...' : 'Save as draft'"
            type="button">
            <mat-spinner 
              *ngIf="isDraftSaving" 
              diameter="16" 
              class="btn-spinner">
            </mat-spinner>
            <mat-icon *ngIf="!isDraftSaving">draft</mat-icon>
            <span class="btn-text">{{ isDraftSaving ? 'Saving...' : 'Save Draft' }}</span>
          </button>
        </div>

        <!-- Primary Action (Right) -->
        <div class="primary-actions">
          <button
            mat-raised-button
            color="primary"
            class="action-btn primary"
            (click)="onSave.emit()"
            [disabled]="!canSave || isSaving"
            [attr.aria-label]="isSaving ? 'Saving changes...' : 'Save changes'"
            type="submit">
            <mat-spinner 
              *ngIf="isSaving" 
              diameter="16" 
              class="btn-spinner light">
            </mat-spinner>
            <mat-icon *ngIf="!isSaving">save</mat-icon>
            <span class="btn-text">{{ isSaving ? 'Saving...' : saveButtonText }}</span>
          </button>
        </div>
      </div>

      <!-- Live Region for Screen Readers -->
      <div 
        class="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        [attr.aria-label]="srStatusMessage">
        {{ srStatusMessage }}
      </div>
    </div>
  `,
  styleUrl: './sticky-action-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StickyActionBarComponent {
  @Input() canSave: boolean = false;
  @Input() canSaveDraft: boolean = false;
  @Input() isSaving: boolean = false;
  @Input() isDraftSaving: boolean = false;
  @Input() hasValidationErrors: boolean = false;
  @Input() validationMessage?: string;
  @Input() saveButtonText: string = 'Save Changes';
  @Input() srStatusMessage?: string; // Screen reader status message

  @Output() onSave = new EventEmitter<void>();
  @Output() onSaveDraft = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
}
