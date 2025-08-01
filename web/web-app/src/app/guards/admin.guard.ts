import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { Observable, map, catchError, of, switchMap, take } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    constructor(
        private authService: FirebaseAuthService,
        private router: Router
    ) { }

    canActivate(): Observable<boolean> {
        return this.authService.isAuthenticated().pipe(
            take(1),
            switchMap(isAuthenticated => {
                if (!isAuthenticated) {
                    // Redirect to landing page if not authenticated
                    this.router.navigate(['/']);
                    return of(false);
                }
                
                // Check if user has admin role
                return this.authService.isAdmin().pipe(
                    map(isAdmin => {
                        if (!isAdmin) {
                            this.router.navigate(['/choose-role']);
                            return false;
                        }
                        return true;
                    }),
                    catchError((error: any) => {
                        console.error('AdminGuard canActivate - error checking admin role:', error);
                        this.router.navigate(['/choose-role']);
                        return of(false);
                    })
                );
            }),
            catchError((error: any) => {
                console.error('AdminGuard canActivate - error:', error);
                // If there's an error, redirect to landing page
                this.router.navigate(['/']);
                return of(false);
            })
        );
    }
}
