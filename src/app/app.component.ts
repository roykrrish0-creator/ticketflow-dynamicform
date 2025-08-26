import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
  imports: [RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      width: 100%;
    }
  `]
})
export class AppComponent {
  readonly title = signal('TicketFlow - Dynamic Form Management');
}
