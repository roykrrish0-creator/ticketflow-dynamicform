import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeService, type ThemeMode } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule
  ],
  template: `
    <button 
      mat-icon-button 
      [matMenuTriggerFor]="themeMenu"
      [matTooltip]="tooltipText()"
      class="theme-toggle-button">
      <mat-icon>{{ themeIcon() }}</mat-icon>
    </button>
    
    <mat-menu #themeMenu="matMenu">
      <button 
        mat-menu-item 
        (click)="setTheme('light')"
        [class.active]="themeService.themeMode() === 'light'">
        <mat-icon>light_mode</mat-icon>
        <span>Light</span>
      </button>
      
      <button 
        mat-menu-item 
        (click)="setTheme('dark')"
        [class.active]="themeService.themeMode() === 'dark'">
        <mat-icon>dark_mode</mat-icon>
        <span>Dark</span>
      </button>
      
      <button 
        mat-menu-item 
        (click)="setTheme('auto')"
        [class.active]="themeService.themeMode() === 'auto'">
        <mat-icon>brightness_auto</mat-icon>
        <span>System</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .theme-toggle-button {
      transition: all 0.2s ease;
      color: var(--mat-sys-on-surface-variant);
      
      &:hover {
        color: var(--mat-sys-primary);
        transform: scale(1.05);
      }
    }
    
    .active {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }
  `]
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);
  
  // Computed values based on theme service
  protected readonly themeIcon = computed(() => {
    const mode = this.themeService.themeMode();
    const applied = this.themeService.appliedTheme();
    
    switch (mode) {
      case 'light':
        return 'light_mode';
      case 'dark':
        return 'dark_mode';
      case 'auto':
      default:
        return applied === 'dark' ? 'dark_mode' : 'light_mode';
    }
  });
  
  protected readonly tooltipText = computed(() => {
    const mode = this.themeService.themeMode();
    const applied = this.themeService.appliedTheme();
    
    switch (mode) {
      case 'light':
        return 'Theme: Light';
      case 'dark':
        return 'Theme: Dark';
      case 'auto':
      default:
        return `Theme: System (${applied})`;
    }
  });
  
  /**
   * Set the theme mode
   */
  setTheme(mode: ThemeMode): void {
    this.themeService.setThemeMode(mode);
  }
  
  /**
   * Toggle between light and dark (ignores auto)
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
