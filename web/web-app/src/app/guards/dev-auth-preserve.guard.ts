import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevAuthPreserveGuard implements CanActivate {
  constructor(
    private router: Router,
    private firebaseAuthService: FirebaseAuthService
  ) {}

  canActivate(): boolean {
    // Only run in development mode
    if (!environment.development) {
      return true;
    }

    // Check if we have stored auth state
    const hasStoredAuth = localStorage.getItem('firebase:authUser:') !== null;
    
    if (hasStoredAuth) {
      
      // Force auth restoration immediately
      this.firebaseAuthService.forceAuthRestore();
      
      // Give Firebase a moment to restore the auth state
      setTimeout(() => {
        const currentUser = this.firebaseAuthService.getCurrentUser();
        if (currentUser) {
          console.log('✅ Development: Auth state restored successfully');
        } else {
          console.log('⚠️ Development: Failed to restore auth state');
        }
      }, 1000);
    }

    return true;
  }
}
