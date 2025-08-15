import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { LocalImageService, ResponsiveImageUrls } from '../services/local-image.service';
import { Subscription, Observable, map, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './role-switcher.component.html'
})
export class RoleSwitcherComponent implements OnInit, OnDestroy {
  imageUrls: ResponsiveImageUrls | null = null;
  backgroundImageUrl: string = 'assets/images/large/hero.webp';
  hasPlayerRole$: Observable<boolean>;
  hasAdminRole$: Observable<boolean>;
  showFallbackRoles: boolean = false;
  private subscription = new Subscription();

  constructor(
    private authService: FirebaseAuthService,
    private localImageService: LocalImageService,
    private router: Router
  ) {
    // Create observables that check roles from the user profile
    this.hasPlayerRole$ = this.authService.userProfile$.pipe(
      map(profile => profile?.roles.includes('player') || false)
    );
    this.hasAdminRole$ = this.authService.userProfile$.pipe(
      map(profile => profile?.roles.includes('admin') || false)
    );
  }

  ngOnInit(): void {
    this.loadHeroImage();
    this.debugRoles();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  private debugRoles(): void {    
    // Debug current user
    const currentUser = this.authService.getCurrentUser();
    
    // Debug user profile
    this.authService.userProfile$.subscribe({
      next: (profile) => {
      },
      error: (error: any) => {
        console.error('Error getting user profile:', error);
      }
    });

    // Debug individual role checks
    this.hasPlayerRole$.subscribe({
      next: (hasPlayer) => {
      },
      error: (error: any) => {
        console.error('Error checking player role:', error);
      }
    });

    this.hasAdminRole$.subscribe({
      next: (hasAdmin) => {
      },
      error: (error: any) => {
        console.error('Error checking admin role:', error);
      }
    });

    // Show fallback roles after 3 seconds if no roles are loaded
    setTimeout(() => {
      this.hasPlayerRole$.pipe(take(1)).subscribe(hasPlayer => {
        this.hasAdminRole$.pipe(take(1)).subscribe(hasAdmin => {
          if (!hasPlayer && !hasAdmin) {
            this.showFallbackRoles = true;
          }
        });
      });
    }, 3000);
  }

  switchToRole(role: string) {
    // Simply navigate based on role - no need to assign roles since user already has them
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'player') {
      this.router.navigate(['/player']);
    } else {
      console.error('Unknown role:', role);
    }
  }



  signOut(): void {
    this.authService.signOut().then(() => {
      this.router.navigate(['/']);
    }).catch((error: any) => {
      console.error('Sign out error:', error);
      // Fallback: redirect to home page
      this.router.navigate(['/']);
    });
  }

  logout(): void {
    this.authService.signOut().then(() => {
      this.router.navigate(['/']);
    }).catch((error: any) => {
      console.error('Logout error:', error);
      // Fallback: redirect to home page
      this.router.navigate(['/']);
    });
  }
}
