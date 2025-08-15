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
  const isApiRequest = apiBase && req.url.startsWith(apiBase);
  
  if (!isApiRequest) {
    return next(req);
  }

  // For Firebase Auth, we need to get the ID token
  return from(firebaseAuthService.getCurrentUser()?.getIdToken() || Promise.resolve(null)).pipe(
    take(1),
    switchMap((token) => {
      if (token) {
        const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        return next(authReq);
      }
      return next(req);
    }),
    catchError(() => next(req))
  );
};
