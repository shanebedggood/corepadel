import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable, map, take, catchError, of } from 'rxjs';
import { FirebaseAuthService } from '../services/firebase-auth.service';

@Injectable({
    providedIn: 'root'
})
export class ProfileCompletionGuard implements CanActivate {
    constructor(
        private router: Router,
        private firebaseAuthService: FirebaseAuthService
    ) { }

    canActivate(): Observable<boolean> {
        return this.firebaseAuthService.userProfile$.pipe(
            take(1),
            map((profile) => {
                if (!profile) {
                    // If no profile, redirect to profile update
                    this.router.navigate(['/player/profile/update']);
                    return false;
                }

                // Check if profile is complete
                const isProfileComplete = this.isProfileComplete(profile);
                
                if (!isProfileComplete) {
                    // Redirect to profile update if not complete
                    this.router.navigate(['/player/profile/update']);
                    return false;
                }

                return true;
            }),
            catchError((error: any) => {
                console.error('ProfileCompletionGuard canActivate - error: ', error);
                // If there's an error, redirect to profile update
                this.router.navigate(['/player/profile/update']);
                return of(false);
            })
        );
    }

    private isProfileComplete(profile: any): boolean {
        // Check if profile_completed flag is set to true
        if (profile.profileCompleted || profile.profile_completed) {
            return true;
        }

        // Check if all required fields are filled
        const hasRequiredFields = 
            profile.first_name &&
            profile.last_name &&
            profile.display_name;

        const hasInterests = profile.interests && profile.interests.length > 0;

        const isComplete = !!(hasRequiredFields && hasInterests);

        return isComplete;
    }
}
