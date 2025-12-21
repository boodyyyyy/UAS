import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogRocketService {
  private logRocket: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Get LogRocket from window object (initialized in main.ts)
      // Or dynamically import if not available
      if ((window as any).LogRocket) {
        this.logRocket = (window as any).LogRocket;
        console.log('LogRocket service initialized from window');
      } else {
        // Fallback: try to get it from the module
        import('logrocket').then((LogRocketModule) => {
          this.logRocket = LogRocketModule.default;
          console.log('LogRocket service initialized from module');
        }).catch((err) => {
          console.warn('Failed to load LogRocket module:', err);
        });
      }
    }
  }

  /**
   * Identify a user in LogRocket
   */
  identify(userId: string, userData?: {
    name?: string;
    email?: string;
    username?: string;
    role?: string;
    [key: string]: any;
  }): void {
    if (this.logRocket && userId) {
      try {
        this.logRocket.identify(userId, userData || {});
        console.log('LogRocket: User identified', userId);
      } catch (error) {
        console.warn('LogRocket: Failed to identify user', error);
      }
    }
  }

  /**
   * Capture an exception in LogRocket
   */
  captureException(error: Error, context?: any): void {
    if (this.logRocket) {
      try {
        this.logRocket.captureException(error, {
          tags: context?.tags || {},
          extra: context || {}
        });
      } catch (err) {
        console.warn('LogRocket: Failed to capture exception', err);
      }
    }
  }

  /**
   * Log a message to LogRocket
   */
  log(message: string, level: 'info' | 'warn' | 'error' = 'info', data?: any): void {
    if (this.logRocket) {
      try {
        this.logRocket.log(message, {
          level,
          data
        });
      } catch (err) {
        console.warn('LogRocket: Failed to log message', err);
      }
    }
  }

  /**
   * Check if LogRocket is available
   */
  isAvailable(): boolean {
    return this.logRocket !== null;
  }
}

/**
 * Global Error Handler that integrates with LogRocket
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logRocketService: LogRocketService | null = null;

  constructor(private injector: Injector) {}

  handleError(error: Error | any): void {
    // Get LogRocket service (using injector to avoid circular dependency)
    try {
      this.logRocketService = this.injector.get(LogRocketService);
    } catch (e) {
      // LogRocket service not available, continue with console logging
    }

    // Log to console
    console.error('Global error handler:', error);

    // Send to LogRocket if available
    if (this.logRocketService && this.logRocketService.isAvailable()) {
      this.logRocketService.captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      );
    }

    // Re-throw the error so Angular's default error handling still works
    throw error;
  }
}
