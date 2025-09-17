import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '../services/error-handler.service';
import { ErrorMappingService } from '../services/error-mapping.service';

/**
 * Global HTTP error interceptor that handles API errors consistently
 * Maps HTTP status codes to user-friendly messages via ErrorHandlerService
 */
export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const errorHandlerService = inject(ErrorHandlerService);
  const errorMappingService = inject(ErrorMappingService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't handle errors for non-API requests
      const isApiRequest = req.url.includes('/api') || req.url.includes('quarkus');
      if (!isApiRequest) {
        return throwError(() => error);
      }

      // Suppress global toast for known, component-handled conflicts (booking same day)
      if (error.status === 409 && req.url.includes('/court-bookings')) {
        return throwError(() => error);
      }

      // Map error using the centralized mapping service
      const errorMapping = errorMappingService.mapHttpError(error);

      // Show appropriate notification
      if (errorMapping.shouldShowPersistent) {
        errorHandlerService.showPersistentError(
          errorMapping.context || 'API Request',
          errorMapping.message
        );
      } else {
        errorHandlerService.showToast({
          severity: 'error',
          summary: errorMapping.context || 'API Request',
          detail: errorMapping.message
        });
      }

      // Log error for debugging
      console.error(`HTTP Error [${error.status}]:`, {
        url: req.url,
        method: req.method,
        error: error.error,
        message: errorMapping.message,
        context: errorMapping.context
      });

      // Re-throw the error so components can still handle it if needed
      return throwError(() => error);
    })
  );
};
