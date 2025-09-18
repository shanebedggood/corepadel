import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { of, throwError } from 'rxjs';

declare const createSpyObj: (name: string, methods: string[]) => any;

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: any;
  let firebaseAuthService: any;

  beforeEach(() => {
    const routerSpy = createSpyObj('Router', ['navigate']);
    const firebaseAuthServiceSpy = createSpyObj('FirebaseAuthService', []);
    firebaseAuthServiceSpy.isAuthenticated$ = of(true);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerSpy },
        { provide: FirebaseAuthService, useValue: firebaseAuthServiceSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
    firebaseAuthService = TestBed.inject(FirebaseAuthService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is authenticated', (done) => {
      firebaseAuthService.isAuthenticated$ = of(true);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(true);
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return false and navigate to landing page when user is not authenticated', (done) => {
      firebaseAuthService.isAuthenticated$ = of(false);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/']);
        done();
      });
    });

    it('should handle error and navigate to landing page', (done) => {
      firebaseAuthService.isAuthenticated$ = throwError(() => new Error('Auth error'));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/']);
        done();
      });
    });
  });
});
