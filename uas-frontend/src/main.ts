import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import LogRocket from 'logrocket';

// Initialize LogRocket immediately (before Angular bootstraps)
// This ensures LogRocket starts recording from the very beginning
if (typeof window !== 'undefined') {
  try {
    LogRocket.init('wu43uu/uas', {
      // Enable console capture
      console: {
        isEnabled: {
          log: true,
          debug: true,
          info: true,
          warn: true,
          error: true
        }
      },
      // Enable network request capture
      network: {
        requestSanitizer: (request: any) => {
          // Don't log sensitive data
          if (request.headers) {
            delete request.headers['Authorization'];
            delete request.headers['authorization'];
          }
          return request;
        },
        responseSanitizer: (response: any) => {
          // Don't log sensitive data in responses
          return response;
        }
      }
    });
    // Make LogRocket available on window for the service
    (window as any).LogRocket = LogRocket;
    console.log('LogRocket initialized successfully');
  } catch (error) {
    console.warn('LogRocket initialization error:', error);
  }
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
