import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { FirebaseAuthService, UserProfile } from '../services/firebase-auth.service';
import { of, throwError } from 'rxjs';

declare const createSpyObj: (name: string, methods: string[]) => any;

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let router: any;
  let firebaseAuthService: any;

  beforeEach(() => {
    const routerSpy = createSpyObj('Router', ['navigate']);
    const firebaseAuthServiceSpy = createSpyObj('FirebaseAuthService', []);
    firebaseAuthServiceSpy.isAuthenticated$ = of(true);
    firebaseAuthServiceSpy.userProfile$ = of(null);

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: Router, useValue: routerSpy },
        { provide: FirebaseAuthService, useValue: firebaseAuthServiceSpy }
      ]
    });

    guard = TestBed.inject(AdminGuard);
    router = TestBed.inject(Router);
    firebaseAuthService = TestBed.inject(FirebaseAuthService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is authenticated and has admin role', (done) => {
      const adminProfile: UserProfile = {
        firebaseUid: 'uid1',
        email: 'admin@test.com',
        username: 'admin',
        roles: ['admin', 'player']
      };

      firebaseAuthService.isAuthenticated$ = of(true);
      firebaseAuthService.userProfile$ = of(adminProfile);

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

    it('should return false and navigate to choose-role when user has no profile', (done) => {
      firebaseAuthService.isAuthenticated$ = of(true);
      firebaseAuthService.userProfile$ = of(null);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/choose-role']);
        done();
      });
    });

    it('should return false and navigate to choose-role when user does not have admin role', (done) => {
      const playerProfile: UserProfile = {
        firebaseUid: 'uid1',
        email: 'player@test.com',
        username: 'player',
        roles: ['player']
      };

      firebaseAuthService.isAuthenticated$ = of(true);
      firebaseAuthService.userProfile$ = of(playerProfile);

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/choose-role']);
        done();
      });
    });

    it('should handle error in authentication check and navigate to landing page', (done) => {
      firebaseAuthService.isAuthenticated$ = throwError(() => new Error('Auth error'));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/']);
        done();
      });
    });

    it('should handle error in profile check and navigate to choose-role', (done) => {
      firebaseAuthService.isAuthenticated$ = of(true);
      firebaseAuthService.userProfile$ = throwError(() => new Error('Profile error'));

      guard.canActivate().subscribe(result => {
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/choose-role']);
        done();
      });
    });
  });
});
