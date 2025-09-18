import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { throwError, of } from 'rxjs';
import { httpErrorInterceptor } from './http-error.interceptor';
import { ErrorHandlerService } from '../services/error-handler.service';
import { ErrorMappingService } from '../services/error-mapping.service';

declare const createSpyObj: (name: string, methods: string[]) => any;

describe('HttpErrorInterceptor', () => {
  let mockErrorHandlerService: any;
  let mockErrorMappingService: any;
  let mockNext: any;

  beforeEach(() => {
    mockErrorHandlerService = createSpyObj('ErrorHandlerService', [
      'showPersistentError',
      'showToast'
    ]);

    mockErrorMappingService = createSpyObj('ErrorMappingService', [
      'mapHttpError'
    ]);

    mockNext = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        { provide: ErrorHandlerService, useValue: mockErrorHandlerService },
        { provide: ErrorMappingService, useValue: mockErrorMappingService }
      ]
    });
  });

  it('should pass through non-API requests without handling errors', () => {
    const request = new HttpRequest('GET', '/assets/test.json');
    const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    mockNext.mockReturnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(request, mockNext).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(mockErrorMappingService.mapHttpError).not.toHaveBeenCalled();
          expect(mockErrorHandlerService.showPersistentError).not.toHaveBeenCalled();
          expect(mockErrorHandlerService.showToast).not.toHaveBeenCalled();
        }
      });
    });
  });

  it('should handle API request errors and show persistent error', () => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({ 
      status: 401, 
      statusText: 'Unauthorized',
      url: '/api/test'
    });
    
    const errorMapping = {
      message: 'You are not authenticated. Please log in again.',
      shouldShowPersistent: true,
      context: 'Authentication'
    };

    mockNext.mockReturnValue(throwError(() => error));
    mockErrorMappingService.mapHttpError.mockReturnValue(errorMapping);

    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(request, mockNext).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(mockErrorMappingService.mapHttpError).toHaveBeenCalledWith(error);
          expect(mockErrorHandlerService.showPersistentError).toHaveBeenCalledWith(
            'Authentication',
            'You are not authenticated. Please log in again.'
          );
          expect(mockErrorHandlerService.showToast).not.toHaveBeenCalled();
        }
      });
    });
  });

  it('should handle API request errors and show toast', () => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({ 
      status: 404, 
      statusText: 'Not Found',
      url: '/api/test'
    });
    
    const errorMapping = {
      message: 'Resource not found.',
      shouldShowPersistent: false,
      context: 'API Request'
    };

    mockNext.mockReturnValue(throwError(() => error));
    mockErrorMappingService.mapHttpError.mockReturnValue(errorMapping);

    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(request, mockNext).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(mockErrorMappingService.mapHttpError).toHaveBeenCalledWith(error);
          expect(mockErrorHandlerService.showToast).toHaveBeenCalledWith({
            severity: 'error',
            summary: 'API Request',
            detail: 'Resource not found.'
          });
          expect(mockErrorHandlerService.showPersistentError).not.toHaveBeenCalled();
        }
      });
    });
  });

  it('should pass through 409 errors for court-bookings without handling', () => {
    const request = new HttpRequest('POST', '/api/court-bookings', {});
    const error = new HttpErrorResponse({ 
      status: 409, 
      statusText: 'Conflict',
      url: '/api/court-bookings'
    });

    mockNext.mockReturnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(request, mockNext).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(mockErrorMappingService.mapHttpError).not.toHaveBeenCalled();
          expect(mockErrorHandlerService.showPersistentError).not.toHaveBeenCalled();
          expect(mockErrorHandlerService.showToast).not.toHaveBeenCalled();
        }
      });
    });
  });

  it('should handle Quarkus API request errors', () => {
    const request = new HttpRequest('GET', 'http://localhost:8080/api/test');
    const error = new HttpErrorResponse({ 
      status: 500, 
      statusText: 'Internal Server Error',
      url: 'http://localhost:8080/api/test'
    });
    
    const errorMapping = {
      message: 'Server error. Please try again later.',
      shouldShowPersistent: true,
      context: 'Server Error'
    };

    mockNext.mockReturnValue(throwError(() => error));
    mockErrorMappingService.mapHttpError.mockReturnValue(errorMapping);

    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(request, mockNext).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(mockErrorMappingService.mapHttpError).toHaveBeenCalledWith(error);
          expect(mockErrorHandlerService.showPersistentError).toHaveBeenCalledWith(
            'Server Error',
            'Server error. Please try again later.'
          );
        }
      });
    });
  });

  it('should pass through successful requests without modification', () => {
    const request = new HttpRequest('GET', '/api/test');
    const response = { status: 200 } as HttpEvent<any>;
    mockNext.mockReturnValue(of(response));

    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(request, mockNext).subscribe(result => {
        expect(result).toBe(response);
        expect(mockErrorMappingService.mapHttpError).not.toHaveBeenCalled();
        expect(mockErrorHandlerService.showPersistentError).not.toHaveBeenCalled();
        expect(mockErrorHandlerService.showToast).not.toHaveBeenCalled();
      });
    });
  });

  it('should use default context when error mapping context is null', () => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({ 
      status: 400, 
      statusText: 'Bad Request',
      url: '/api/test'
    });
    
    const errorMapping = {
      message: 'Bad request.',
      shouldShowPersistent: false,
      context: null
    };

    mockNext.mockReturnValue(throwError(() => error));
    mockErrorMappingService.mapHttpError.mockReturnValue(errorMapping);

    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(request, mockNext).subscribe({
        error: (err) => {
          expect(mockErrorHandlerService.showToast).toHaveBeenCalledWith({
            severity: 'error',
            summary: 'API Request',
            detail: 'Bad request.'
          });
        }
      });
    });
  });
});
