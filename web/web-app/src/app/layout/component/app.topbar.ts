import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { LayoutService } from '../service/layout.service';
import { Observable, map, Subscription } from 'rxjs';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule, ButtonModule, MenuModule, RippleModule, StyleClassModule],
    template: `
        <div class="layout-topbar">
            <button class="p-link layout-menu-button layout-topbar-button" (click)="onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>

            <div class="layout-topbar-logo" (click)="onLogoClick()">
                <img [src]="'assets/logo.svg'" alt="Logo" height="40px" />
                <span>Core Padel</span>
            </div>

            <div class="layout-topbar-button-container">
                <button class="p-link layout-topbar-menu-button layout-topbar-button" (click)="onTopbarMenuButton()" type="button">
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <div class="layout-topbar-menu" [ngClass]="{'layout-topbar-menu-mobile-active': layoutService.isSidebarActive()}">
                    <button class="p-link layout-topbar-button" (click)="onMenuToggle()">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button class="p-link layout-topbar-button" (click)="onMenuToggle()">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                    <button class="p-link layout-topbar-button" (click)="onMenuToggle()">
                        <i class="pi pi-cog"></i>
                        <span>Settings</span>
                    </button>
                </div>
            </div>

            @if (isAuthenticated$ | async) {
                <div class="layout-topbar-user-menu">
                    @if (userProfile$ | async; as profile) {
                        <div class="user-info">
                            <span class="user-name">{{ profile.firstName }} {{ profile.lastName }}</span>
                            <span class="user-email">{{ profile.email }}</span>
                        </div>
                    }
                    
                    @if (hasMultipleRoles$ | async) {
                        <div class="role-switcher">
                            <button pButton type="button" 
                                    label="Switch Role" 
                                    icon="pi pi-refresh" 
                                    class="p-button-text p-button-sm"
                                    (click)="switchRole()">
                            </button>
                        </div>
                    }

                    <button pButton type="button" 
                            label="Logout" 
                            icon="pi pi-sign-out" 
                            class="p-button-text p-button-danger"
                            (click)="logout()">
                    </button>
                </div>
            }
        </div>
    `
})
export class AppTopbarComponent implements OnInit, OnDestroy {
    isAuthenticated$: Observable<boolean>;
    userProfile$: Observable<any>;
    hasMultipleRoles$: Observable<boolean>;
    hasAdminRole$: Observable<boolean>;

    private subscriptions: Subscription = new Subscription();

    constructor(
        public layoutService: LayoutService,
        private router: Router,
        private authService: FirebaseAuthService
    ) {
        this.isAuthenticated$ = this.authService.isAuthenticated$;
        this.userProfile$ = this.authService.userProfile$;
        this.hasMultipleRoles$ = this.authService.userProfile$.pipe(
            map(profile => (profile?.roles || []).length > 1)
        );
        this.hasAdminRole$ = this.authService.userProfile$.pipe(
            map(profile => profile?.roles.includes('admin') || false)
        );
    }

    ngOnInit() {
        // Auto-redirect based on roles
        this.subscriptions.add(
            this.hasMultipleRoles$.subscribe(hasMultiple => {
                if (!hasMultiple) {
                    this.hasAdminRole$.subscribe((isAdmin: boolean) => {
                        if (isAdmin) {
                            this.router.navigate(['/admin']);
                        } else {
                            this.router.navigate(['/player']);
                        }
                    });
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
        this.router.navigate(['/']);
    }

    onTopbarMenuButton() {
        this.layoutService.onMenuToggle();
    }

    onSidebarButtonClick() {
        this.layoutService.onMenuToggle();
    }

    switchRole() {
        this.router.navigate(['/choose-role']);
    }

    logout() {
        this.authService.signOut().then(() => {
            this.router.navigate(['/']);
        }).catch((error: any) => {
            console.error('Logout error:', error);
        });
    }
}
