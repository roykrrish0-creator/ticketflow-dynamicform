import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  
  // Theme mode signal
  private readonly _themeMode = signal<ThemeMode>('auto');
  readonly themeMode = this._themeMode.asReadonly();
  
  // Actual applied theme signal (resolves 'auto' to 'light' or 'dark')
  private readonly _appliedTheme = signal<'light' | 'dark'>('light');
  readonly appliedTheme = this._appliedTheme.asReadonly();
  
  // Media query for system preference
  private readonly mediaQuery = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
  
  constructor() {
    this.initializeTheme();
    this.setupMediaQueryListener();
  }
  
  /**
   * Set the theme mode
   */
  setThemeMode(mode: ThemeMode): void {
    this._themeMode.set(mode);
    this.applyTheme();
    this.saveThemePreference(mode);
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const currentApplied = this._appliedTheme();
    const newMode = currentApplied === 'light' ? 'dark' : 'light';
    this.setThemeMode(newMode);
  }
  
  /**
   * Get system theme preference
   */
  getSystemTheme(): 'light' | 'dark' {
    return this.mediaQuery?.matches ? 'dark' : 'light';
  }
  
  /**
   * Check if dark theme is active
   */
  isDarkTheme(): boolean {
    return this._appliedTheme() === 'dark';
  }
  
  /**
   * Initialize theme from saved preference or system default
   */
  private initializeTheme(): void {
    const savedTheme = this.getSavedThemePreference();
    if (savedTheme) {
      this._themeMode.set(savedTheme);
    }
    this.applyTheme();
  }
  
  /**
   * Apply the current theme to the document
   */
  private applyTheme(): void {
    const mode = this._themeMode();
    let resolvedTheme: 'light' | 'dark';
    
    // Resolve 'auto' to actual theme
    if (mode === 'auto') {
      resolvedTheme = this.getSystemTheme();
    } else {
      resolvedTheme = mode;
    }
    
    this._appliedTheme.set(resolvedTheme);
    
    // Apply color-scheme CSS property
    const htmlElement = this.document.documentElement;
    
    if (mode === 'auto') {
      htmlElement.style.colorScheme = 'light dark';
      htmlElement.classList.remove('dark-theme', 'light-theme');
    } else if (resolvedTheme === 'dark') {
      htmlElement.style.colorScheme = 'dark';
      htmlElement.classList.remove('light-theme');
      htmlElement.classList.add('dark-theme');
    } else {
      htmlElement.style.colorScheme = 'light';
      htmlElement.classList.remove('dark-theme');
      htmlElement.classList.add('light-theme');
    }
  }
  
  /**
   * Setup media query listener for system theme changes
   */
  private setupMediaQueryListener(): void {
    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', () => {
        // Only react to system changes if in auto mode
        if (this._themeMode() === 'auto') {
          this.applyTheme();
        }
      });
    }
  }
  
  /**
   * Save theme preference to localStorage
   */
  private saveThemePreference(mode: ThemeMode): void {
    try {
      localStorage.setItem('theme-mode', mode);
    } catch (error) {
      console.warn('Could not save theme preference:', error);
    }
  }
  
  /**
   * Get saved theme preference from localStorage
   */
  private getSavedThemePreference(): ThemeMode | null {
    try {
      const saved = localStorage.getItem('theme-mode');
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        return saved as ThemeMode;
      }
    } catch (error) {
      console.warn('Could not load theme preference:', error);
    }
    return null;
  }
  
  /**
   * Get available Material Design system color tokens
   */
  getSystemColors(): Record<string, string> {
    const style = getComputedStyle(this.document.documentElement);
    
    return {
      // Primary colors
      'primary': style.getPropertyValue('--mat-sys-primary').trim(),
      'onPrimary': style.getPropertyValue('--mat-sys-on-primary').trim(),
      'primaryContainer': style.getPropertyValue('--mat-sys-primary-container').trim(),
      'onPrimaryContainer': style.getPropertyValue('--mat-sys-on-primary-container').trim(),
      
      // Secondary colors
      'secondary': style.getPropertyValue('--mat-sys-secondary').trim(),
      'onSecondary': style.getPropertyValue('--mat-sys-on-secondary').trim(),
      'secondaryContainer': style.getPropertyValue('--mat-sys-secondary-container').trim(),
      'onSecondaryContainer': style.getPropertyValue('--mat-sys-on-secondary-container').trim(),
      
      // Tertiary colors
      'tertiary': style.getPropertyValue('--mat-sys-tertiary').trim(),
      'onTertiary': style.getPropertyValue('--mat-sys-on-tertiary').trim(),
      'tertiaryContainer': style.getPropertyValue('--mat-sys-tertiary-container').trim(),
      'onTertiaryContainer': style.getPropertyValue('--mat-sys-on-tertiary-container').trim(),
      
      // Surface colors
      'surface': style.getPropertyValue('--mat-sys-surface').trim(),
      'onSurface': style.getPropertyValue('--mat-sys-on-surface').trim(),
      'surfaceVariant': style.getPropertyValue('--mat-sys-surface-variant').trim(),
      'onSurfaceVariant': style.getPropertyValue('--mat-sys-on-surface-variant').trim(),
      'surfaceContainer': style.getPropertyValue('--mat-sys-surface-container').trim(),
      'surfaceContainerHigh': style.getPropertyValue('--mat-sys-surface-container-high').trim(),
      'surfaceContainerHighest': style.getPropertyValue('--mat-sys-surface-container-highest').trim(),
      'surfaceContainerLow': style.getPropertyValue('--mat-sys-surface-container-low').trim(),
      'surfaceContainerLowest': style.getPropertyValue('--mat-sys-surface-container-lowest').trim(),
      
      // Error colors
      'error': style.getPropertyValue('--mat-sys-error').trim(),
      'onError': style.getPropertyValue('--mat-sys-on-error').trim(),
      'errorContainer': style.getPropertyValue('--mat-sys-error-container').trim(),
      'onErrorContainer': style.getPropertyValue('--mat-sys-on-error-container').trim(),
      
      // Outline colors
      'outline': style.getPropertyValue('--mat-sys-outline').trim(),
      'outlineVariant': style.getPropertyValue('--mat-sys-outline-variant').trim(),
      
      // Background
      'background': style.getPropertyValue('--mat-sys-background').trim(),
      'onBackground': style.getPropertyValue('--mat-sys-on-background').trim(),
    };
  }
}
