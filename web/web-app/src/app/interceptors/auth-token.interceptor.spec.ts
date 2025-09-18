import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpHeaders } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { authTokenInterceptorFn } from './auth-token.interceptor';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { environment } from '../../environments';

declare const createSpyObj: (name: string, methods: string[]) => any;

describe('AuthTokenInterceptor', () => {
  let mockFirebaseAuthService: any;
  let mockNext: any;
  let mockUser: any;

  beforeEach(() => {
    mockUser = {
      getIdToken: jest.fn()
    };

    mockFirebaseAuthService = createSpyObj('FirebaseAuthService', ['getCurrentUser']);
    mockFirebaseAuthService.getCurrentUser.mockReturnValue(mockUser);

    mockNext = jest.fn().mockReturnValue(of({} as HttpEvent<any>));

    TestBed.configureTestingModule({
      providers: [
        { provide: FirebaseAuthService, useValue: mockFirebaseAuthService }
      ]
    });
  });

  it('should pass through request if it already has Authorization header', () => {
    const request = new HttpRequest('GET', '/api/test', null, {
      headers: new HttpHeaders().set('Authorization', 'Bearer existing-token')
    });

    TestBed.runInInjectionContext(() => {
      authTokenInterceptorFn(request, mockNext).subscribe();
    });

    expect(mockNext).toHaveBeenCalledWith(request);
    expect(mockUser.getIdToken).not.toHaveBeenCalled();
  });

  it('should pass through non-API requests', () => {
    const request = new HttpRequest('GET', '/assets/test.json');

    TestBed.runInInjectionContext(() => {
      authTokenInterceptorFn(request, mockNext).subscribe();
    });

    expect(mockNext).toHaveBeenCalledWith(request);
    expect(mockUser.getIdToken).not.toHaveBeenCalled();
  });

  it('should pass through request if no current user', () => {
    mockFirebaseAuthService.getCurrentUser.mockReturnValue(null);
    const request = new HttpRequest('GET', '/api/test');

    TestBed.runInInjectionContext(() => {
      authTokenInterceptorFn(request, mockNext).subscribe();
    });

    expect(mockNext).toHaveBeenCalledWith(request);
    expect(mockUser.getIdToken).not.toHaveBeenCalled();
  });

  it('should add Authorization header for API requests with valid token', (done) => {
    const token = 'valid-token';
    mockUser.getIdToken.mockReturnValue(Promise.resolve(token));
    
    const request = new HttpRequest('GET', '/api/test');
    const expectedRequest = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    TestBed.runInInjectionContext(() => {
      authTokenInterceptorFn(request, mockNext).subscribe(() => {
        expect(mockNext).toHaveBeenCalledWith(expectedRequest);
        expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
        done();
      });
    });
  });

  it('should add Authorization header for absolute API requests', (done) => {
    const token = 'valid-token';
    mockUser.getIdToken.mockReturnValue(Promise.resolve(token));
    
    const request = new HttpRequest('GET', `${environment.quarkusApiUrl}/test`);
    const expectedRequest = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    TestBed.runInInjectionContext(() => {
      authTokenInterceptorFn(request, mockNext).subscribe(() => {
        expect(mockNext).toHaveBeenCalledWith(expectedRequest);
        expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
        done();
      });
    });
  });

  it('should fallback to non-force refresh if force refresh fails', (done) => {
    const token = 'fallback-token';
    mockUser.getIdToken.mockImplementation((forceRefresh: boolean) => {
      if (forceRefresh) {
        return Promise.reject(new Error('Force refresh failed'));
      }
      return Promise.resolve(token);
    });
    
    const request = new HttpRequest('GET', '/api/test');
    const expectedRequest = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    TestBed.runInInjectionContext(() => {
      authTokenInterceptorFn(request, mockNext).subscribe(() => {
        expect(mockNext).toHaveBeenCalledWith(expectedRequest);
        expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
        expect(mockUser.getIdToken).toHaveBeenCalledWith(false);
        done();
      });
    });
  });

  it('should pass through request if both token attempts fail', (done) => {
    mockUser.getIdToken.mockReturnValue(Promise.reject(new Error('Token failed')));
    
    const request = new HttpRequest('GET', '/api/test');

    TestBed.runInInjectionContext(() => {
      authTokenInterceptorFn(request, mockNext).subscribe(() => {
        expect(mockNext).toHaveBeenCalledWith(request);
        expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
        expect(mockUser.getIdToken).toHaveBeenCalledWith(false);
        done();
      });
    });
  });

  it('should pass through request if token is null', (done) => {
    mockUser.getIdToken.mockReturnValue(Promise.resolve(null));
    
    const request = new HttpRequest('GET', '/api/test');

    TestBed.runInInjectionContext(() => {
      authTokenInterceptorFn(request, mockNext).subscribe(() => {
        expect(mockNext).toHaveBeenCalledWith(request);
        expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
        done();
      });
    });
  });
});
