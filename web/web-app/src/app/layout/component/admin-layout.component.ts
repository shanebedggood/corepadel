import { Component, Renderer2, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AdminSidebar } from './admin-sidebar.component';
import { AdminTopbarComponent } from './admin-topbar.component';
import { LayoutService } from '../service/layout.service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        AdminSidebar,
        AdminTopbarComponent,
    ],
    template: `
        <div class="layout-wrapper" [ngClass]="containerClass">
            <app-admin-topbar></app-admin-topbar>
            <div class="layout-main-container">
                <app-admin-sidebar></app-admin-sidebar>
                <div class="layout-main">
                    <router-outlet></router-outlet>
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class AdminLayoutComponent implements OnDestroy {
    overlayMenuOpenSubscription: Subscription;

    @ViewChild(AdminSidebar) adminSidebar!: AdminSidebar;
    @ViewChild(AdminTopbarComponent) adminTopBar!: AdminTopbarComponent;

    constructor(
        public layoutService: LayoutService,
        public renderer: Renderer2,
        public router: Router
    ) {
        // Set menu mode to static for admin layout (sidebar always visible, content shifts)
        this.layoutService.layoutConfig.set({
            ...this.layoutService.layoutConfig(),
            menuMode: 'static'
        });

        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (this.layoutService.layoutState().staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });

        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                this.hideMenu();
            });
    }



    hideMenu() {
        this.layoutService.layoutState.update((prev) => ({
            ...prev,
            staticMenuMobileActive: false,
            menuHoverActive: false
        }));

        this.unblockBodyScroll();
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' ' + 'blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(
                new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'),
                ' '
            );
        }
    }

    get containerClass() {
        return {
            'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
            'layout-static-inactive':
                this.layoutService.layoutState().staticMenuDesktopInactive &&
                this.layoutService.layoutConfig().menuMode === 'static',
            'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive
        };
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }
    }
}
