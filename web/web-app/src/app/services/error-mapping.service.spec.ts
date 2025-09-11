import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorMappingService } from './error-mapping.service';

describe('ErrorMappingService', () => {
  let service: ErrorMappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorMappingService]
    });
    service = TestBed.inject(ErrorMappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('mapHttpError', () => {
    it('should map 401 error correctly', () => {
      const error = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        url: '/api/users'
      });

      const result = service.mapHttpError(error);

      expect(result.message).toBe('You are not authenticated. Please log in again.');
      expect(result.shouldShowPersistent).toBe(true);
      expect(result.context).toBe('User');
    });

    it('should map 403 error correctly', () => {
      const error = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden',
        url: '/api/tournaments'
      });

      const result = service.mapHttpError(error);

      expect(result.message).toBe('You do not have permission to perform this action.');
      expect(result.shouldShowPersistent).toBe(true);
      expect(result.context).toBe('Tournament');
    });

    it('should map 404 error correctly', () => {
      const error = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: '/api/clubs/123'
      });

      const result = service.mapHttpError(error);

      expect(result.message).toBe('Club not found.');
      expect(result.shouldShowPersistent).toBe(false);
      expect(result.context).toBe('Club');
    });

    it('should map 500 error correctly', () => {
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        url: '/api/venues'
      });

      const result = service.mapHttpError(error);

      expect(result.message).toBe('Server error. Please try again later.');
      expect(result.shouldShowPersistent).toBe(true);
      expect(result.context).toBe('Venue');
    });

    it('should map network error correctly', () => {
      const error = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
        url: '/api/bookings'
      });

      const result = service.mapHttpError(error);

      expect(result.message).toBe('Network error. Please check your connection and try again.');
      expect(result.shouldShowPersistent).toBe(true);
      expect(result.context).toBe('Booking');
    });

    it('should use custom error message when available', () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        url: '/api/users',
        error: { message: 'Custom validation error' }
      });

      const result = service.mapHttpError(error);

      expect(result.message).toBe('Custom validation error');
      expect(result.shouldShowPersistent).toBe(false);
    });
  });

  describe('mapFirebaseAuthError', () => {
    it('should map user-not-found error', () => {
      const error = { code: 'auth/user-not-found' };
      const result = service.mapFirebaseAuthError(error);

      expect(result.message).toBe('User not found. Please check your credentials.');
      expect(result.shouldShowPersistent).toBe(false);
      expect(result.context).toBe('Authentication');
    });

    it('should map wrong-password error', () => {
      const error = { code: 'auth/wrong-password' };
      const result = service.mapFirebaseAuthError(error);

      expect(result.message).toBe('Incorrect password. Please try again.');
      expect(result.shouldShowPersistent).toBe(false);
      expect(result.context).toBe('Authentication');
    });

    it('should map network error', () => {
      const error = { code: 'auth/network-request-failed' };
      const result = service.mapFirebaseAuthError(error);

      expect(result.message).toBe('Network error. Please check your connection and try again.');
      expect(result.shouldShowPersistent).toBe(true);
      expect(result.context).toBe('Network Error');
    });

    it('should handle unknown error codes', () => {
      const error = { code: 'auth/unknown-error', message: 'Custom error message' };
      const result = service.mapFirebaseAuthError(error);

      expect(result.message).toBe('Custom error message');
      expect(result.shouldShowPersistent).toBe(false);
      expect(result.context).toBe('Authentication');
    });
  });

  describe('mapApplicationError', () => {
    it('should map ChunkLoadError', () => {
      const error = { name: 'ChunkLoadError' };
      const result = service.mapApplicationError(error);

      expect(result.message).toBe('Application update detected. Please refresh the page to get the latest version.');
      expect(result.shouldShowPersistent).toBe(true);
      expect(result.context).toBe('Update Available');
    });

    it('should map TypeError', () => {
      const error = { name: 'TypeError', message: 'Cannot read properties of undefined' };
      const result = service.mapApplicationError(error);

      expect(result.message).toBe('A data loading error occurred. Please try again.');
      expect(result.shouldShowPersistent).toBe(false);
      expect(result.context).toBe('Data Error');
    });

    it('should map ReferenceError', () => {
      const error = { name: 'ReferenceError' };
      const result = service.mapApplicationError(error);

      expect(result.message).toBe('A reference error occurred. Please refresh the page.');
      expect(result.shouldShowPersistent).toBe(true);
      expect(result.context).toBe('Reference Error');
    });

    it('should handle generic errors', () => {
      const error = { message: 'Something went wrong' };
      const result = service.mapApplicationError(error);

      expect(result.message).toBe('Something went wrong');
      expect(result.shouldShowPersistent).toBe(true);
      expect(result.context).toBe('Application Error');
    });
  });
});
