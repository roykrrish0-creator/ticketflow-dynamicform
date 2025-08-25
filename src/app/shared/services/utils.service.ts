/**
 * Utility Service
 * Provides common utility functions and helper methods used throughout the application
 */

import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { UUID, Timestamp, JsonValue, Result, AppError } from '../models/core.types';
import { APP_CONSTANTS } from '../../core/config/app.config';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  /**
   * ID Generation
   */
  generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  generateShortId(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = this.generateShortId(4);
    return `${APP_CONSTANTS.TICKETS.TICKET_NUMBER_PREFIX}${timestamp}-${random}`;
  }

  /**
   * Date and Time Utilities
   */
  formatDate(date: Timestamp, format: string = 'MM/dd/yyyy'): string {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
      .replace('yyyy', year.toString())
      .replace('MM', month)
      .replace('dd', day);
  }

  formatDateTime(date: Timestamp, includeSeconds: boolean = false): string {
    if (!date) return '';
    
    const d = new Date(date);
    const dateStr = this.formatDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    const timeStr = includeSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
    return `${dateStr} ${timeStr}`;
  }

  getRelativeTime(date: Timestamp): string {
    if (!date) return '';
    
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  }

  isBusinessHour(date: Timestamp, timezone: string = 'America/New_York'): boolean {
    const d = new Date(date);
    const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = d.getHours();
    
    // Monday to Friday, 9 AM to 5 PM
    return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 17;
  }

  /**
   * String Utilities
   */
  capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  camelCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  kebabCase(str: string): string {
    return str.replace(/\s+/g, '-').toLowerCase();
  }

  snakeCase(str: string): string {
    return str.replace(/\s+/g, '_').toLowerCase();
  }

  truncateText(text: string, maxLength: number, suffix: string = '...'): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Array Utilities
   */
  groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {} as { [key: string]: T[] });
  }

  sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  unique<T>(array: T[], key?: keyof T): T[] {
    if (!key) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Object Utilities
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array) return obj.map(item => this.deepClone(item)) as unknown as T;
    
    const cloned = {} as { [key: string]: any };
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned as T;
  }

  deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  }

  pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }

  private isObject(item: any): item is Record<string, any> {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Validation Utilities
   */
  createEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const valid = APP_CONSTANTS.VALIDATION.EMAIL.PATTERN.test(control.value);
      return valid ? null : { email: { value: control.value } };
    };
  }

  createPhoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const valid = APP_CONSTANTS.VALIDATION.PHONE.PATTERN.test(control.value);
      return valid ? null : { phone: { value: control.value } };
    };
  }

  createUrlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const valid = APP_CONSTANTS.VALIDATION.URL.PATTERN.test(control.value);
      return valid ? null : { url: { value: control.value } };
    };
  }

  createPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = control.value;
      const config = APP_CONSTANTS.VALIDATION.PASSWORD;
      const errors: { [key: string]: boolean } = {};

      if (value.length < config.MIN_LENGTH) {
        errors['minlength'] = true;
      }

      if (value.length > config.MAX_LENGTH) {
        errors['maxlength'] = true;
      }

      if (config.REQUIRE_UPPERCASE && !/[A-Z]/.test(value)) {
        errors['requireUppercase'] = true;
      }

      if (config.REQUIRE_LOWERCASE && !/[a-z]/.test(value)) {
        errors['requireLowercase'] = true;
      }

      if (config.REQUIRE_NUMBERS && !/\d/.test(value)) {
        errors['requireNumbers'] = true;
      }

      if (config.REQUIRE_SPECIAL_CHARS && !/[@$!%*?&]/.test(value)) {
        errors['requireSpecialChars'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * File Utilities
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  isImageFile(filename: string): boolean {
    const ext = this.getFileExtension(filename).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext);
  }

  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }

  /**
   * Color Utilities
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  getContrastColor(hex: string): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return '#000000';
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }

  /**
   * Local Storage Utilities
   */
  setStorageItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(APP_CONSTANTS.CACHE.STORAGE_KEY_PREFIX + key, serializedValue);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  getStorageItem<T>(key: string): T | null {
    try {
      const serializedValue = localStorage.getItem(APP_CONSTANTS.CACHE.STORAGE_KEY_PREFIX + key);
      return serializedValue ? JSON.parse(serializedValue) : null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  removeStorageItem(key: string): void {
    try {
      localStorage.removeItem(APP_CONSTANTS.CACHE.STORAGE_KEY_PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  clearStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(APP_CONSTANTS.CACHE.STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  /**
   * Error Handling Utilities
   */
  createError(
    type: AppError['type'],
    code: string,
    message: string,
    details?: JsonValue,
    context?: JsonValue
  ): AppError {
    return {
      id: this.generateUUID(),
      type,
      code,
      message,
      details,
      timestamp: new Date(),
      context
    };
  }

  isRetryableError(error: AppError): boolean {
    const retryableTypes = ['network', 'system'];
    const nonRetryableErrors = APP_CONSTANTS.ERROR_HANDLING.CRITICAL_ERRORS;
    
    return retryableTypes.includes(error.type) && !nonRetryableErrors.includes(error.code);
  }

  /**
   * Performance Utilities
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  /**
   * Browser Utilities
   */
  copyToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return Promise.resolve(successful);
      } catch (error) {
        document.body.removeChild(textArea);
        return Promise.resolve(false);
      }
    }
  }

  downloadFile(data: Blob, filename: string): void {
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  getDeviceInfo(): {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    userAgent: string;
  } {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    return {
      isMobile,
      isTablet,
      isDesktop,
      userAgent
    };
  }
}
