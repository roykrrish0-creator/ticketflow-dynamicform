import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';

@Component({
    selector: 'app-root',
  imports: [RouterOutlet, ThemeToggleComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container">
      <!-- Theme Toggle - Fixed position for easy access -->
      <div class="theme-toggle-container">
        <app-theme-toggle></app-theme-toggle>
      </div>
      
      <!-- Main Content -->
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      width: 100%;
      position: relative;
    }
    
    .theme-toggle-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      border-radius: 50%;
      padding: 0.25rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    
    .theme-toggle-container:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }
    
    :host-context(.dark) .theme-toggle-container {
      background: rgba(31, 41, 55, 0.9);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    :host-context(.dark) .theme-toggle-container:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
  `]
})
export class AppComponent {
  readonly title = signal('TicketFlow - Dynamic Form Management');
}
