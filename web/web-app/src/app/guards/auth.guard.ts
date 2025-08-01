import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable, map, take, catchError, of } from 'rxjs';
import { FirebaseAuthService } from '../services/firebase-auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private firebaseAuthService: FirebaseAuthService
    ) { }

    canActivate(): Observable<boolean> {
        return this.firebaseAuthService.isAuthenticated().pipe(
            take(1),
            map((isAuthenticated) => {
                if (!isAuthenticated) {
                    // Redirect to landing page if not authenticated
                    this.router.navigate(['/']);
                    return false;
                }
                return true;
            }),
            catchError((error: any) => {
                console.error('AuthGuard canActivate - error: ', error);
                // If there's an error, redirect to landing page
                this.router.navigate(['/']);
                return of(false);
            })
        );
    }
}
