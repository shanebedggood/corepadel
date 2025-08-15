import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { PopoverModule } from 'primeng/popover';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
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
        this.isAuthenticated$ = this.authService.isAuthenticated$;
        this.userProfile$ = this.authService.userProfile$;
        this.hasMultipleRoles$ = this.authService.userProfile$.pipe(map(profile => (profile?.roles || []).length > 1));
        this.hasAdminRole$ = this.authService.userProfile$.pipe(map(profile => profile?.roles.includes('admin') || false));
    }

    ngOnInit() {
        // Subscribe to admin role status
        this.hasAdminRole$.subscribe(isAdmin => {
            if (!isAdmin) {
                // Redirect to player dashboard if not admin
                this.router.navigate(['/player']);
            }
        });
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
        // User creation is now handled automatically by Lambda trigger
        // Just navigate to player dashboard
        this.isMobileMenuVisible = false;
        this.router.navigate(['/player']);
    }

    onLogoutClick() {
        this.isMobileMenuVisible = false;
        this.authService.signOut().then(() => {
            this.router.navigate(['/']);
        }).catch((error: any) => {
            console.error('Logout error:', error);
        });
    }
}
