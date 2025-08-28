/**
 * Application Configuration
 * Centralized configuration management for the entire application
 */

import { InjectionToken } from '@angular/core';
import { AppConfig } from '../../shared/models/core.types';

// Configuration injection token
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

// Application constants
export const APP_CONSTANTS = {
  APP_NAME: 'TicketFlow',
  VERSION: '1.0.0',
  
  // API Configuration
  API: {
    BASE_URL: '/api/v1',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    ENDPOINTS: {
      TICKETS: '/tickets',
      FORMS: '/forms',
      USERS: '/users',
      COMMENTS: '/comments',
      ATTACHMENTS: '/attachments',
      HISTORY: '/history',
      REPORTS: '/reports'
    }
  },

  // Form Configuration
  FORMS: {
    MAX_SECTIONS: 50,
    MAX_FIELDS_PER_SECTION: 100,
    MAX_OPTIONS_PER_FIELD: 1000,
    MAX_NESTED_DEPTH: 5,
    DEFAULT_DEBOUNCE_TIME: 300,
    AUTO_SAVE_INTERVAL: 30000,
    VALIDATION_TIMEOUT: 5000,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },

  // UI Configuration
  UI: {
    BREAKPOINTS: {
      XS: 576,
      SM: 768,
      MD: 992,
      LG: 1200,
      XL: 1400
    },
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 5000,
    MODAL_BACKDROP_TIMEOUT: 150,
    SCROLL_BEHAVIOR: 'smooth' as ScrollBehavior,
    PAGINATION: {
      DEFAULT_PAGE_SIZE: 25,
      PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
      MAX_PAGE_SIZE: 1000
    }
  },

  // Cache Configuration
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 100,
    STORAGE_KEY_PREFIX: 'ticketflow_',
    KEYS: {
      USER_PREFERENCES: 'user_preferences',
      FORM_SCHEMAS: 'form_schemas',
      TICKET_FILTERS: 'ticket_filters',
      UI_STATE: 'ui_state'
    }
  },

  // Validation Configuration
  VALIDATION: {
    PASSWORD: {
      MIN_LENGTH: 8,
      MAX_LENGTH: 128,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
      REQUIRE_SPECIAL_CHARS: true,
      PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    },
    EMAIL: {
      PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    PHONE: {
      PATTERN: /^[\+]?[1-9][\d]{0,15}$/
    },
    URL: {
      PATTERN: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)$/
    }
  },

  // Security Configuration
  SECURITY: {
    SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour
    CSRF_TOKEN_HEADER: 'X-CSRF-Token',
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    PASSWORD_RESET_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
    ALLOWED_ORIGINS: ['http://localhost:4200', 'https://ticketflow.example.com'],
    CONTENT_SECURITY_POLICY: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      'font-src': ["'self'", "https://fonts.gstatic.com"],
      'img-src': ["'self'", "data:", "blob:", "https:"],
      'connect-src': ["'self'", "ws:", "wss:"]
    }
  },

  // Ticket Configuration
  TICKETS: {
    STATUSES: {
      DRAFT: { label: 'Draft', color: '#6c757d', category: 'new' },
      SUBMITTED: { label: 'Submitted', color: '#17a2b8', category: 'new' },
      OPEN: { label: 'Open', color: '#007bff', category: 'active' },
      ASSIGNED: { label: 'Assigned', color: '#fd7e14', category: 'active' },
      IN_PROGRESS: { label: 'In Progress', color: '#ffc107', category: 'active' },
      ON_HOLD: { label: 'On Hold', color: '#6f42c1', category: 'active' },
      PENDING_REVIEW: { label: 'Pending Review', color: '#e83e8c', category: 'active' },
      PENDING_CUSTOMER: { label: 'Pending Customer', color: '#20c997', category: 'active' },
      RESOLVED: { label: 'Resolved', color: '#28a745', category: 'resolved' },
      CLOSED: { label: 'Closed', color: '#343a40', category: 'closed' },
      CANCELLED: { label: 'Cancelled', color: '#dc3545', category: 'closed' },
      REOPENED: { label: 'Reopened', color: '#fd7e14', category: 'active' }
    },
    PRIORITIES: {
      URGENT: { label: 'Urgent', color: '#dc3545', level: 5 },
      HIGH: { label: 'High', color: '#fd7e14', level: 4 },
      MEDIUM: { label: 'Medium', color: '#ffc107', level: 3 },
      LOW: { label: 'Low', color: '#28a745', level: 2 },
      PLANNING: { label: 'Planning', color: '#6c757d', level: 1 }
    },
    AUTO_CLOSE_DAYS: 30,
    MAX_ATTACHMENTS: 10,
    MAX_ATTACHMENT_SIZE: 25 * 1024 * 1024, // 25MB
    TICKET_NUMBER_PREFIX: 'TF-',
    TICKET_NUMBER_LENGTH: 8
  },

  // Localization
  LOCALIZATION: {
    DEFAULT_LOCALE: 'en-US',
    SUPPORTED_LOCALES: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN'],
    DATE_FORMATS: {
      'en-US': 'MM/dd/yyyy',
      'es-ES': 'dd/MM/yyyy',
      'fr-FR': 'dd/MM/yyyy',
      'de-DE': 'dd.MM.yyyy',
      'it-IT': 'dd/MM/yyyy',
      'pt-BR': 'dd/MM/yyyy',
      'ja-JP': 'yyyy/MM/dd',
      'ko-KR': 'yyyy. MM. dd.',
      'zh-CN': 'yyyy/MM/dd'
    },
    CURRENCY_CODES: {
      'en-US': 'USD',
      'es-ES': 'EUR',
      'fr-FR': 'EUR',
      'de-DE': 'EUR',
      'it-IT': 'EUR',
      'pt-BR': 'BRL',
      'ja-JP': 'JPY',
      'ko-KR': 'KRW',
      'zh-CN': 'CNY'
    }
  },

  // Performance Configuration
  PERFORMANCE: {
    VIRTUAL_SCROLL_ITEM_HEIGHT: 50,
    LAZY_LOAD_THRESHOLD: 100,
    IMAGE_LAZY_LOAD_THRESHOLD: '200px',
    DEBOUNCE_TIME: {
      SEARCH: 300,
      VALIDATION: 300,
      RESIZE: 100,
      SCROLL: 16
    },
    BATCH_SIZE: {
      FORM_UPDATES: 50,
      API_REQUESTS: 25,
      DOM_UPDATES: 100
    }
  },

  // Accessibility
  ACCESSIBILITY: {
    FOCUS_TRAP_ENABLED: true,
    ANNOUNCE_CHANGES: true,
    HIGH_CONTRAST_THRESHOLD: 4.5,
    KEYBOARD_SHORTCUTS: {
      SAVE: 'Ctrl+S',
      CANCEL: 'Escape',
      SEARCH: 'Ctrl+K',
      NEW_TICKET: 'Ctrl+N',
      HELP: 'F1'
    }
  },

  // Error Handling
  ERROR_HANDLING: {
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAYS: [1000, 2000, 5000],
    SHOW_STACK_TRACE: false, // Only in development
    LOG_ERRORS: true,
    SILENT_ERRORS: ['ValidationError', 'CancelledError'],
    CRITICAL_ERRORS: ['SecurityError', 'PaymentError', 'DataCorruptionError']
  },

  // Feature Flags (for A/B testing and gradual rollouts)
  FEATURES: {
    ADVANCED_SEARCH: true,
    BULK_OPERATIONS: true,
    REAL_TIME_UPDATES: true,
    DARK_MODE: true,
    ACCESSIBILITY_MODE: true,
    OFFLINE_MODE: false,
    ANALYTICS: true,
    EXPORT_FEATURES: true,
    CUSTOM_THEMES: false,
    AI_SUGGESTIONS: false,
    VOICE_INPUT: false,
    MOBILE_APP: false
  }
} as const;

// Environment-specific configuration factory
export function createAppConfig(): AppConfig {
  const isProduction = false; // This would be set based on environment
  const isDevelopment = !isProduction;

  return {
    api: {
      baseUrl: isProduction ? 'https://api.ticketflow.com/v1' : 'http://localhost:3000/api/v1',
      timeout: APP_CONSTANTS.API.TIMEOUT,
      retryAttempts: APP_CONSTANTS.API.RETRY_ATTEMPTS
    },
    features: {
      ...APP_CONSTANTS.FEATURES,
      // Override features based on environment
      ANALYTICS: isProduction,
      AI_SUGGESTIONS: isProduction
    },
    ui: {
      theme: 'light',
      language: 'en-US',
      dateFormat: 'MM/dd/yyyy',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    performance: {
      debounceTime: APP_CONSTANTS.PERFORMANCE.DEBOUNCE_TIME.VALIDATION,
      cacheTimeout: APP_CONSTANTS.CACHE.DEFAULT_TTL,
      maxCacheSize: APP_CONSTANTS.CACHE.MAX_SIZE
    }
  };
}

// Type guards for configuration validation
export function isValidAppConfig(config: any): config is AppConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    typeof config.api === 'object' &&
    typeof config.api.baseUrl === 'string' &&
    typeof config.api.timeout === 'number' &&
    typeof config.features === 'object' &&
    typeof config.ui === 'object' &&
    typeof config.performance === 'object'
  );
}

// Configuration validation
export function validateAppConfig(config: AppConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.api?.baseUrl) {
    errors.push('API base URL is required');
  }

  if (!config.api?.timeout || config.api.timeout <= 0) {
    errors.push('API timeout must be a positive number');
  }

  if (!config.ui?.theme || !['light', 'dark', 'auto'].includes(config.ui.theme)) {
    errors.push('UI theme must be light, dark, or auto');
  }

  if (!config.performance?.debounceTime || config.performance.debounceTime < 0) {
    errors.push('Performance debounce time must be non-negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Runtime configuration merger
export function mergeConfigs(base: AppConfig, overrides: Partial<AppConfig>): AppConfig {
  return {
    api: { ...base.api, ...overrides.api },
    features: { ...base.features, ...overrides.features },
    ui: { ...base.ui, ...overrides.ui },
    performance: { ...base.performance, ...overrides.performance }
  };
}
