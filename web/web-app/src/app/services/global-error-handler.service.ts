import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler {
    private errorHandlerService = inject(ErrorHandlerService);

    handleError(error: any): void {
        console.error('Global error caught:', error);

        // Extract meaningful error information
        let errorMessage = 'An unexpected error occurred. Please refresh the page and try again.';
        let errorContext = 'Application Error';

        if (error?.message) {
            errorMessage = error.message;
        }

        if (error?.name) {
            errorContext = error.name;
        }

        // Handle specific error types
        if (error?.name === 'ChunkLoadError') {
            errorMessage = 'Application update detected. Please refresh the page to get the latest version.';
            errorContext = 'Update Available';
        } else if (error?.name === 'TypeError' && error?.message?.includes('Cannot read properties')) {
            errorMessage = 'A data loading error occurred. Please try again.';
            errorContext = 'Data Error';
        } else if (error?.name === 'ReferenceError') {
            errorMessage = 'A reference error occurred. Please refresh the page.';
            errorContext = 'Reference Error';
        } else if (error?.stack?.includes('zone.js')) {
            // Zone.js errors are often related to async operations
            errorMessage = 'An async operation failed. Please try again.';
            errorContext = 'Async Error';
        }

        // Show persistent error for critical issues
        this.errorHandlerService.showPersistentError(
            errorContext,
            errorMessage
        );

        // Log to console for debugging
        console.group('Error Details');
        console.error('Error:', error);
        console.error('Stack:', error?.stack);
        console.error('Context:', errorContext);
        console.error('Message:', errorMessage);
        console.groupEnd();

        // In production, you might want to send this to an error reporting service
        // this.reportError(error, errorContext, errorMessage);
    }

    /**
     * Report error to external service (implement as needed)
     */
    private reportError(error: any, context: string, message: string): void {
        // Example: Send to error reporting service
        // this.errorReportingService.report({
        //     error: error,
        //     context: context,
        //     message: message,
        //     timestamp: new Date(),
        //     userAgent: navigator.userAgent,
        //     url: window.location.href
        // });
    }
}
