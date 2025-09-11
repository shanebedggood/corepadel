import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ErrorMessage {
    id: string;
    severity: 'error' | 'warn' | 'info' | 'success';
    summary: string;
    detail: string;
    persistent: boolean;
    timestamp: Date;
}

export interface ToastMessage {
    severity: 'error' | 'warn' | 'info' | 'success';
    summary: string;
    detail: string;
    life?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlerService {
    private persistentMessages$ = new BehaviorSubject<ErrorMessage[]>([]);

    constructor(private messageService: MessageService) { }

    /**
     * Show a toast notification with appropriate lifetime based on severity
     * Use for temporary messages that don't require user action
     */
    showToast(message: ToastMessage): void {
        const lifetime = this.getToastLifetime(message.severity, message.life);
        this.messageService.add({
            severity: message.severity,
            summary: message.summary,
            detail: message.detail,
            life: lifetime
        });
    }

    /**
     * Get appropriate toast lifetime based on severity
     */
    private getToastLifetime(severity: string, customLife?: number): number {
        if (customLife !== undefined) {
            return customLife;
        }

        switch (severity) {
            case 'success':
                return 4000; // 4 seconds - quick confirmation
            case 'info':
                return 5000; // 5 seconds - informational
            case 'warn':
                return 8000; // 8 seconds - important but not critical
            case 'error':
                return 0; // Sticky - requires user attention
            default:
                return 5000;
        }
    }

    /**
     * Show a persistent error message (requires manual dismissal)
     * Use for critical errors that require user attention or action
     */
    showPersistentError(
        summary: string,
        detail: string
    ): string {
        const message: ErrorMessage = {
            id: this.generateId(),
            severity: 'error',
            summary,
            detail,
            persistent: true,
            timestamp: new Date()
        };
        const currentMessages = this.persistentMessages$.value;
        this.persistentMessages$.next([...currentMessages, message]);
        return message.id;
    }

    /**
     * Show a persistent warning message
     */
    showPersistentWarning(
        summary: string,
        detail: string
    ): string {
        const message: ErrorMessage = {
            id: this.generateId(),
            severity: 'warn',
            summary,
            detail,
            persistent: true,
            timestamp: new Date()
        };
        const currentMessages = this.persistentMessages$.value;
        this.persistentMessages$.next([...currentMessages, message]);
        return message.id;
    }

    /**
     * Show a persistent info message
     */
    showPersistentInfo(
        summary: string,
        detail: string
    ): string {
        const message: ErrorMessage = {
            id: this.generateId(),
            severity: 'info',
            summary,
            detail,
            persistent: true,
            timestamp: new Date()
        };
        const currentMessages = this.persistentMessages$.value;
        this.persistentMessages$.next([...currentMessages, message]);
        return message.id;
    }

    /**
     * Show a persistent success message
     */
    showPersistentSuccess(
        summary: string,
        detail: string
    ): string {
        const message: ErrorMessage = {
            id: this.generateId(),
            severity: 'success',
            summary,
            detail,
            persistent: true,
            timestamp: new Date()
        };
        const currentMessages = this.persistentMessages$.value;
        this.persistentMessages$.next([...currentMessages, message]);
        return message.id;
    }

    /**
     * Remove a persistent message by ID
     */
    removeMessage(
        messageId: string
    ): void {
        const currentMessages = this.persistentMessages$.value;
        const filteredMessages = currentMessages.filter(msg => msg.id !== messageId);
        this.persistentMessages$.next(filteredMessages);
    }

    /**
     * Clear all persistent messages
     */
    clearAllMessages(): void {
        this.persistentMessages$.next([]);
    }

    /**
     * Get observable of persistent messages
     */
    getPersistentMessages(): Observable<ErrorMessage[]> {
        return this.persistentMessages$.asObservable();
    }

    /**
     * Handle API errors with appropriate user notification
     */
    handleApiError(
        error: any,
        context: string = 'Operation'
    ): void {
        console.error(`${context} error:`, error);
        let errorMessage = 'An unexpected error occurred. Please try again.';
        let shouldShowPersistent = false;

        // Handle different types of errors
        if (error?.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'User not found. Please check your credentials.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address. Please check your email.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection and try again.';
                    shouldShowPersistent = true;
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    shouldShowPersistent = true;
                    break;
                case 'permission-denied':
                    errorMessage = 'You do not have permission to perform this action.';
                    shouldShowPersistent = true;
                    break;
                case 'unavailable':
                    errorMessage = 'Service temporarily unavailable. Please try again later.';
                    shouldShowPersistent = true;
                    break;
                default:
                    if (error.message && error.message !== 'An error occurred during authentication.') {
                        errorMessage = error.message;
                    }
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }

        // Determine whether to show as toast or persistent message
        if (shouldShowPersistent) {
            this.showPersistentError(context, errorMessage);
        } else {
            this.showToast({
                severity: 'error',
                summary: context,
                detail: errorMessage
            });
        }
    }

    /**
     * Handle validation errors
     */
    handleValidationError(
        fieldName: string,
        message: string
    ): void {
        this.showToast({
            severity: 'error',
            summary: 'Validation Error',
            detail: `${fieldName}: ${message}`
        });
    }

    /**
     * Handle success messages
     */
    handleSuccess(
        message: string,
        context: string = 'Success'
    ): void {
        this.showToast({
            severity: 'success',
            summary: context,
            detail: message
        });
    }

    /**
     * Handle info messages
     */
    handleInfo(
        message: string,
        context: string = 'Information'
    ): void {
        this.showToast({
            severity: 'info',
            summary: context,
            detail: message
        });
    }

    /**
     * Handle warning messages
     */
    handleWarning(
        message: string,
        context: string = 'Warning'
    ): void {
        this.showToast({
            severity: 'warn',
            summary: context,
            detail: message
        });
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
