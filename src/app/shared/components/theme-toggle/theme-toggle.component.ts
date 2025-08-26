import { Component, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <button
      mat-icon-button
      [matTooltip]="isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
      (click)="toggleTheme()"
      class="theme-toggle-button">
      <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `,
  styles: [`
    .theme-toggle-button {
      transition: all 0.3s ease;
    }
    
    .theme-toggle-button:hover {
      transform: scale(1.1);
    }
  `]
})
export class ThemeToggleComponent {
  private document = inject(DOCUMENT);
  
  // Signal for reactive dark mode state
  isDarkMode = signal(this.document.documentElement.classList.contains('dark'));

  toggleTheme(): void {
    const isDark = this.isDarkMode();
    
    if (isDark) {
      // Switch to light mode
      this.document.documentElement.classList.remove('dark');
      this.document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      // Switch to dark mode
      this.document.documentElement.classList.add('dark');
      this.document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    
    // Update signal
    this.isDarkMode.set(!isDark);
  }

  constructor() {
    // Initialize theme from localStorage on component init
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.document.documentElement.classList.add('dark');
      this.document.body.classList.add('dark');
      this.isDarkMode.set(true);
    }
  }
}
