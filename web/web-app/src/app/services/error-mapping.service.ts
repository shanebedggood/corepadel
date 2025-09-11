import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorMapping {
    message: string;
    shouldShowPersistent: boolean;
    context?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ErrorMappingService {

    /**
     * Map HTTP error response to user-friendly message
     */
    mapHttpError(error: HttpErrorResponse, context?: string): ErrorMapping {
        const defaultContext = context || this.getContextFromUrl(error.url || '');
        
        switch (error.status) {
            case 400:
                return {
                    message: this.getBadRequestMessage(error),
                    shouldShowPersistent: false,
                    context: defaultContext
                };
                
            case 401:
                return {
                    message: 'You are not authenticated. Please log in again.',
                    shouldShowPersistent: true,
                    context: 'Authentication'
                };
                
            case 403:
                return {
                    message: 'You do not have permission to perform this action.',
                    shouldShowPersistent: true,
                    context: 'Permission Denied'
                };
                
            case 404:
                return {
                    message: this.getNotFoundMessage(defaultContext),
                    shouldShowPersistent: false,
                    context: defaultContext
                };
                
            case 409:
                return {
                    message: this.getConflictMessage(error),
                    shouldShowPersistent: false,
                    context: defaultContext
                };
                
            case 422:
                return {
                    message: this.getValidationMessage(error),
                    shouldShowPersistent: false,
                    context: 'Validation Error'
                };
                
            case 429:
                return {
                    message: 'Too many requests. Please wait a moment and try again.',
                    shouldShowPersistent: true,
                    context: 'Rate Limited'
                };
                
            case 500:
                return {
                    message: 'Server error. Please try again later.',
                    shouldShowPersistent: true,
                    context: 'Server Error'
                };
                
            case 502:
            case 503:
            case 504:
                return {
                    message: 'Service temporarily unavailable. Please try again later.',
                    shouldShowPersistent: true,
                    context: 'Service Unavailable'
                };
                
            case 0:
                return {
                    message: 'Network error. Please check your connection and try again.',
                    shouldShowPersistent: true,
                    context: 'Network Error'
                };
                
            default:
                return {
                    message: this.getDefaultMessage(error),
                    shouldShowPersistent: error.status >= 500,
                    context: defaultContext
                };
        }
    }

    /**
     * Map Firebase Auth errors to user-friendly messages
     */
    mapFirebaseAuthError(error: any): ErrorMapping {
        const errorCode = error?.code || '';
        
        switch (errorCode) {
            case 'auth/user-not-found':
                return {
                    message: 'User not found. Please check your credentials.',
                    shouldShowPersistent: false,
                    context: 'Authentication'
                };
                
            case 'auth/wrong-password':
                return {
                    message: 'Incorrect password. Please try again.',
                    shouldShowPersistent: false,
                    context: 'Authentication'
                };
                
            case 'auth/invalid-email':
                return {
                    message: 'Invalid email address. Please check your email.',
                    shouldShowPersistent: false,
                    context: 'Authentication'
                };
                
            case 'auth/email-already-in-use':
                return {
                    message: 'This email is already registered. Please use a different email.',
                    shouldShowPersistent: false,
                    context: 'Registration'
                };
                
            case 'auth/weak-password':
                return {
                    message: 'Password is too weak. Please choose a stronger password.',
                    shouldShowPersistent: false,
                    context: 'Registration'
                };
                
            case 'auth/network-request-failed':
                return {
                    message: 'Network error. Please check your connection and try again.',
                    shouldShowPersistent: true,
                    context: 'Network Error'
                };
                
            case 'auth/too-many-requests':
                return {
                    message: 'Too many failed attempts. Please try again later.',
                    shouldShowPersistent: true,
                    context: 'Rate Limited'
                };
                
            case 'auth/user-disabled':
                return {
                    message: 'This account has been disabled. Please contact support.',
                    shouldShowPersistent: true,
                    context: 'Account Disabled'
                };
                
            default:
                return {
                    message: error?.message || 'An authentication error occurred. Please try again.',
                    shouldShowPersistent: false,
                    context: 'Authentication'
                };
        }
    }

    /**
     * Map general application errors
     */
    mapApplicationError(error: any): ErrorMapping {
        if (error?.name === 'ChunkLoadError') {
            return {
                message: 'Application update detected. Please refresh the page to get the latest version.',
                shouldShowPersistent: true,
                context: 'Update Available'
            };
        }
        
        if (error?.name === 'TypeError' && error?.message?.includes('Cannot read properties')) {
            return {
                message: 'A data loading error occurred. Please try again.',
                shouldShowPersistent: false,
                context: 'Data Error'
            };
        }
        
        if (error?.name === 'ReferenceError') {
            return {
                message: 'A reference error occurred. Please refresh the page.',
                shouldShowPersistent: true,
                context: 'Reference Error'
            };
        }
        
        return {
            message: error?.message || 'An unexpected error occurred. Please try again.',
            shouldShowPersistent: true,
            context: 'Application Error'
        };
    }

    private getContextFromUrl(url: string): string {
        if (url.includes('/tournaments')) return 'Tournament';
        if (url.includes('/users')) return 'User';
        if (url.includes('/clubs')) return 'Club';
        if (url.includes('/venues')) return 'Venue';
        if (url.includes('/bookings')) return 'Booking';
        return 'API Request';
    }

    private getBadRequestMessage(error: HttpErrorResponse): string {
        if (error.error?.message) {
            return error.error.message;
        }
        return 'Invalid request. Please check your input.';
    }

    private getNotFoundMessage(context: string): string {
        const contextMap: { [key: string]: string } = {
            'Tournament': 'Tournament not found.',
            'User': 'User not found.',
            'Club': 'Club not found.',
            'Venue': 'Venue not found.',
            'Booking': 'Booking not found.'
        };
        
        return contextMap[context] || 'The requested resource was not found.';
    }

    private getConflictMessage(error: HttpErrorResponse): string {
        if (error.error?.message) {
            return error.error.message;
        }
        return 'This action conflicts with existing data.';
    }

    private getValidationMessage(error: HttpErrorResponse): string {
        if (error.error?.message) {
            return error.error.message;
        }
        if (error.error?.errors && Array.isArray(error.error.errors)) {
            return error.error.errors.map((e: any) => e.message || e).join(', ');
        }
        return 'The data you provided is invalid.';
    }

    private getDefaultMessage(error: HttpErrorResponse): string {
        if (error.error?.message) {
            return error.error.message;
        }
        return 'An unexpected error occurred. Please try again.';
    }
}
