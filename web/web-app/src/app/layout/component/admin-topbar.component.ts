import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { PopoverModule } from 'primeng/popover';
import { FirebaseAuthService, UserRole } from '../../services/firebase-auth.service';
import { UserService } from '../../services/user.service';
import { LayoutService } from '../service/layout.service';
import { Observable, map, Subscription, switchMap } from 'rxjs';

@Component({
    selector: 'app-admin-topbar',
    standalone: true,
    imports: [CommonModule, ButtonModule, MenuModule, RippleModule, StyleClassModule, PopoverModule],
    templateUrl: './admin-topbar.component.html'
})
export class AdminTopbarComponent implements OnInit, OnDestroy {
    isAuthenticated$: Observable<boolean>;
    userProfile$: Observable<any>;
    hasMultipleRoles$: Observable<boolean>;
    hasAdminRole$: Observable<boolean>;
    isMobileMenuVisible = false;

    @ViewChild('mobileMenu') mobileMenu!: ElementRef;
    @ViewChild('profilePanel') profilePanel: any;

    private subscriptions: Subscription = new Subscription();

    constructor(
        public layoutService: LayoutService,
        private router: Router,
        private authService: FirebaseAuthService,
        private userService: UserService
    ) {
        this.isAuthenticated$ = this.authService.isAuthenticated();
        this.userProfile$ = this.authService.getCurrentUserProfile();
        this.hasMultipleRoles$ = this.authService.getUserRoles().pipe(
            map(roles => roles.length > 1)
        );
        this.hasAdminRole$ = this.authService.hasRole('admin');
    }

    ngOnInit() {
        // Verify admin access
        this.subscriptions.add(
            this.hasAdminRole$.subscribe(isAdmin => {
                if (!isAdmin) {
                    this.router.navigate(['/choose-role']);
                }
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    onMenuToggle() {
        this.layoutService.onMenuToggle();
    }

    onLogoClick() {
        this.router.navigate(['/admin']);
    }

    toggleMobileMenu() {
        this.isMobileMenuVisible = !this.isMobileMenuVisible;
    }

    onCalendarClick() {
        this.isMobileMenuVisible = false;
    }

    onMessagesClick() {
        this.isMobileMenuVisible = false;
    }

    onProfileClick() {
        this.isMobileMenuVisible = false;
        this.router.navigate(['/admin/profile']);
    }

    switchToPlayer() {
        // First ensure user is synced to PostgreSQL, then assign role
        this.authService.getUserProfileAndSync().pipe(
            switchMap(profile => {
                if (!profile) {
                    throw new Error('No user profile found');
                }
                // Use the new method that handles Firebase UID to PostgreSQL user ID conversion
                return this.userService.addRoleToUserByFirebaseUid(profile.firebase_uid, 'player');
            })
        ).subscribe({
            next: (userRole) => {
                // Close mobile menu
                this.isMobileMenuVisible = false;
                // Navigate to player dashboard
                this.router.navigate(['/player']);
            },
            error: (error) => {
                console.error('Failed to assign player role:', error);
                // Close mobile menu
                this.isMobileMenuVisible = false;
                // Check if it's a duplicate role error (which is actually OK)
                if (error.status === 500 && error.error && error.error.includes('duplicate key')) {
                    console.log('User already has player role, proceeding with navigation');
                }
                // Navigate to player dashboard regardless
                this.router.navigate(['/player']);
            }
        });
    }

    onLogoutClick() {
        this.isMobileMenuVisible = false;
        this.authService.signOut().subscribe({
            next: () => {
                this.router.navigate(['/']);
            },
            error: (error: any) => {
                console.error('Logout error:', error);
            }
        });
    }
}
