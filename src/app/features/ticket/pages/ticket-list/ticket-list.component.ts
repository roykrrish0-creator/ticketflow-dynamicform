import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="main-container">
      <div class="content">
        <h1>TicketFlow</h1>
        <p>Dynamic Form System</p>
        
        <button mat-raised-button color="primary" class="open-ticket-btn" (click)="openTicketView()">
          <mat-icon>assignment</mat-icon>
          Open Tickets View
        </button>
      </div>
    </div>
  `,
  styles: [`
    .main-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .content {
      text-align: center;
      padding: 48px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      width: 100%;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 16px 0;
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    p {
      font-size: 1.125rem;
      color: #6c757d;
      margin: 0 0 32px 0;
    }

    .open-ticket-btn {
      font-size: 16px;
      font-weight: 500;
      padding: 12px 32px;
      border-radius: 8px;
      min-width: 200px;
      height: 48px;
      
      mat-icon {
        margin-right: 8px;
      }
    }
  `]
})
export class TicketListComponent {
  constructor(private router: Router) {}

  openTicketView(): void {
    // Navigate to the first sample ticket
    this.router.navigate(['/tickets', 'TICK-001']);
  }
}
