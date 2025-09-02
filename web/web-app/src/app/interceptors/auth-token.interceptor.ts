import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { switchMap, take, catchError } from 'rxjs/operators';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { environment } from '../../environments';

// Function-based interceptor for Angular 17+
export const authTokenInterceptorFn: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const firebaseAuthService = inject(FirebaseAuthService);
    
  
  // Skip if request already has an Authorization header
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  // Only attach token for backend API requests
  const apiBase = environment.quarkusApiUrl ?? '';
  const isAbsoluteApi = apiBase && req.url.startsWith(apiBase);
  const isRelativeApi = req.url.startsWith('/api');
  const isApiRequest = isAbsoluteApi || isRelativeApi;
  
  if (!isApiRequest) {
    return next(req);
  }

  // For Firebase Auth, we need to get the ID token
  const currentUser = firebaseAuthService.getCurrentUser();
  
  if (!currentUser) {
    return next(req);
  }
  
  // Try to get token with force refresh if needed
  return from(currentUser.getIdToken(true)).pipe(
    take(1),
    switchMap((token) => {
      if (token) {
        const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        return next(authReq);
      }
      return next(req);
    }),
    catchError((error) => {
      // Try to get token without force refresh as fallback
      return from(currentUser.getIdToken(false)).pipe(
        take(1),
        switchMap((fallbackToken) => {
          if (fallbackToken) {
            const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${fallbackToken}` } });
            return next(authReq);
          }
          return next(req);
        }),
        catchError(() => next(req))
      );
    })
  );
};
