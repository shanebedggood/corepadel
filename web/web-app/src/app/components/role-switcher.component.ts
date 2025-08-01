import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { UserService } from '../services/user.service';
import { LocalImageService, ResponsiveImageUrls } from '../services/local-image.service';
import { Subscription, Observable, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './role-switcher.component.html'
})
export class RoleSwitcherComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  currentRole: string = '';
  imageUrls: ResponsiveImageUrls | null = null;
  backgroundImageUrl: string = 'assets/images/large/hero.jpg';
  hasPlayerRole$: Observable<boolean>;
  hasAdminRole$: Observable<boolean>;
  private subscription = new Subscription();

  constructor(
    private authService: FirebaseAuthService,
    private userService: UserService,
    private localImageService: LocalImageService,
    private router: Router
  ) {
    this.hasPlayerRole$ = this.authService.hasRole('player');
    this.hasAdminRole$ = this.authService.hasRole('admin');
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadHeroImage();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadCurrentUser(): void {
  }

  private loadHeroImage(): void {
    this.subscription = this.localImageService.getResponsiveImageUrls('hero').subscribe({
      next: (urls) => {
        this.imageUrls = urls;
      },
      error: (error) => {
        console.error('Error loading hero images:', error);
        // No fallback - images must be available in local storage
        this.imageUrls = null;
      }
    });
  }

  switchToRole(role: string): void {
    this.currentRole = role;
    
    // First ensure user is synced to PostgreSQL, then assign role
    this.authService.getUserProfileAndSync().pipe(
      switchMap(profile => {
        if (!profile) {
          throw new Error('No user profile found');
        }
        // Use the new method that handles Firebase UID to PostgreSQL user ID conversion
        return this.userService.addRoleToUserByFirebaseUid(profile.firebase_uid, role);
      })
    ).subscribe({
      next: (userRole) => {
        // Navigate to the appropriate route
        if (role === 'player') {
          this.router.navigate(['/player']);
        } else if (role === 'admin') {
          this.router.navigate(['/admin']);
        }
      },
      error: (error) => {
        console.error(`Failed to assign role ${role}:`, error);
        // Even if role assignment fails, try to navigate
        if (role === 'player') {
          this.router.navigate(['/player']);
        } else if (role === 'admin') {
          this.router.navigate(['/admin']);
        }
      }
    });
  }

  navigateToPlayer(): void {
    this.currentRole = 'player';
    this.router.navigate(['/player']);
  }

  navigateToAdmin(): void {
    this.currentRole = 'admin';
    this.router.navigate(['/admin']);
  }

  signOut(): void {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error: any) => {
        console.error('Sign out error:', error);
        // Fallback: redirect to home page
        this.router.navigate(['/']);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
      },
      error: (error: any) => {
        console.error('Logout error:', error);
        // Fallback: redirect to home page
        this.router.navigate(['/']);
      }
    });
  }
}
