import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { UserService } from '../../services/user.service';
import { LayoutService } from '../service/layout.service';
import { Observable, map, Subscription, switchMap } from 'rxjs';

@Component({
    selector: 'app-player-topbar',
    standalone: true,
    imports: [CommonModule, ButtonModule, MenuModule, RippleModule, StyleClassModule],
    template: `
        <div class="layout-topbar bg-gradient-to-br from-green-700 to-green-500 border-b-3 border-orange-400">
            <div class="layout-topbar-logo-container">
                <button class="layout-menu-button layout-topbar-action !text-lg" (click)="onMenuToggle()">
                    <i class="pi pi-bars text-white"></i>
                </button>
                <a class="layout-topbar-logo flex items-center gap-2" routerLink="/player">
                    <span class="text-white">STRIDE & SERVE</span>
                    <span class="bg-yellow-400 text-green-900 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Player</span>
                </a>
            </div>

            <div class="layout-topbar-actions">
                <!-- Mobile menu toggle button - only show on mobile/tablet -->
                <button class="layout-topbar-menu-button layout-topbar-action lg:hidden text-white !text-lg" (click)="toggleMobileMenu()">
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <!-- Mobile menu content -->
                <div class="layout-topbar-menu mobile-menu border-t-3 border-orange-400" #mobileMenu [class.show]="isMobileMenuVisible">
                    <div class="layout-topbar-menu-content">
                        <button type="button" class="layout-topbar-action text-green-900 hover:bg-green-50 !text-lg" (click)="onCalendarClick()">
                            <i class="pi pi-calendar"></i>
                            <span>Calendar</span>
                        </button>
                        <button type="button" class="layout-topbar-action text-green-900 hover:bg-green-50 !text-lg" (click)="onMessagesClick()">
                            <i class="pi pi-inbox"></i>
                            <span>Messages</span>
                        </button>
                        <button type="button" class="layout-topbar-action text-green-900 hover:bg-green-50 !text-lg" (click)="onProfileClick()">
                            <i class="pi pi-user"></i>
                            <span>My Profile</span>
                        </button>

                        <!-- Role switcher for users with multiple roles -->
                        @if (hasMultipleRoles$ | async) {
                            <div class="border-t border-gray-200 mt-2 pt-2">
                                <button type="button" class="layout-topbar-action text-green-900 hover:bg-green-50 text-base font-semibold !text-lg" (click)="switchToAdmin()">
                                    <i class="pi pi-arrow-right-arrow-left text-lg"></i>
                                    <span class="text-base font-semibold">Switch to Admin</span>
                                </button>
                            </div>
                        }

                        <div class="border-t border-gray-200 mt-2 pt-2">
                            <button type="button" class="layout-topbar-action text-green-900 hover:bg-green-50 !text-lg" (click)="onLogoutClick()">
                                <i class="pi pi-sign-out"></i>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Desktop menu content -->
                <div class="layout-topbar-menu desktop-menu">
                    <div class="layout-topbar-menu-content">
                        <button type="button" class="layout-topbar-action flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-white !text-lg" (click)="onCalendarClick()">
                            <i class="pi pi-calendar text-white"></i>
                        </button>
                        <button type="button" class="layout-topbar-action flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-white !text-lg" (click)="onMessagesClick()">
                            <i class="pi pi-inbox text-white"></i>
                        </button>
                        <button type="button" class="layout-topbar-action flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-white !text-lg" (click)="onProfileClick()">
                            <i class="pi pi-user text-white"></i>
                        </button>

                        <!-- Role switcher for users with multiple roles -->
                        @if (hasMultipleRoles$ | async) {
                            <button type="button" class="layout-topbar-action flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-white !text-lg" (click)="switchToAdmin()">
                                <i class="pi pi-arrow-right-arrow-left text-white text-lg"></i>
                            </button>
                        }
                        <button type="button" class="layout-topbar-action flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors duration-200 text-white !text-lg" (click)="onLogoutClick()">
                            <i class="pi pi-sign-out text-white"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class PlayerTopbarComponent implements OnInit, OnDestroy {
    isAuthenticated$: Observable<boolean>;
    userProfile$: Observable<any>;
    hasMultipleRoles$: Observable<boolean>;
    hasPlayerRole$: Observable<boolean>;
    isMobileMenuVisible = false;

    @ViewChild('mobileMenu') mobileMenu!: ElementRef;

    private subscriptions: Subscription = new Subscription();

    constructor(
        public layoutService: LayoutService,
        private router: Router,
        private authService: FirebaseAuthService,
        private userService: UserService
    ) {
        this.isAuthenticated$ = this.authService.isAuthenticated$;
        this.userProfile$ = this.authService.userProfile$;
        this.hasMultipleRoles$ = this.authService.userProfile$.pipe(
            map((profile: any) => profile?.roles?.length > 1 || false)
        );
        this.hasPlayerRole$ = this.authService.userProfile$.pipe(
            map((profile: any) => profile?.roles?.includes('player') || false)
        );
    }

    ngOnInit() {
        // Verify player access
        this.subscriptions.add(
            this.hasPlayerRole$.subscribe(hasPlayer => {
                if (!hasPlayer) {
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
        this.router.navigate(['/player']);
    }

    toggleMobileMenu() {
        this.isMobileMenuVisible = !this.isMobileMenuVisible;
    }

    onCalendarClick() {
    }

    onMessagesClick() {
    }

    onProfileClick() {
        this.router.navigate(['/player/profile']);
    }

    async switchToAdmin() {
        try {
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                console.error('No user found');
                return;
            }

            // For now, just navigate to admin - role assignment can be handled later
            this.isMobileMenuVisible = false;
            this.router.navigate(['/admin']);
        } catch (error) {
            console.error('Failed to switch to admin:', error);
        }
    }

    async onLogoutClick() {
        try {
            await this.authService.signOut();
            this.router.navigate(['/']);
        } catch (error: any) {
            console.error('Logout error:', error);
        }
    }
}
