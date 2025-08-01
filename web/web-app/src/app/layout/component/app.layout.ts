import { Component, Renderer2, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AppTopbarComponent } from './app.topbar';
import { AppSidebar } from './app.sidebar';

import { LayoutService } from '../service/layout.service';
import { PersistentMessagesComponent } from '../../components/persistent-messages.component';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        AppTopbarComponent,
        AppSidebar,
        PersistentMessagesComponent,
        ToastModule
    ],
    template: `
        <div class="layout-wrapper" [ngClass]="containerClass">
            <app-topbar></app-topbar>
            <app-sidebar></app-sidebar>
            <app-persistent-messages></app-persistent-messages>
            <p-toast></p-toast>
            <div class="layout-main-container">
                <div class="layout-main">
                    <router-outlet></router-outlet>
                </div>
            </div>
            <div class="layout-mask animate-fadein"></div>
        </div>
    `
})
export class AppLayout implements OnDestroy {
    overlayMenuOpenSubscription: Subscription;
    menuOutsideClickListener: any;

    @ViewChild(AppSidebar) appSidebar!: AppSidebar;
    @ViewChild(AppTopbarComponent) appTopBar!: AppTopbarComponent;

    // Add a private property to store previous menuMode
    private previousMenuMode: string | undefined;

    constructor(
        public layoutService: LayoutService,
        public renderer: Renderer2,
        public router: Router
    ) {
        // Store previous menuMode to restore later
        this.previousMenuMode = this.layoutService.layoutConfig().menuMode;
        this.layoutService.layoutConfig.set({
            ...this.layoutService.layoutConfig(),
            menuMode: 'overlay'
        });
        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
                    if (this.isOutsideClicked(event)) {
                        this.hideMenu();
                    }
                });
            }

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

    isOutsideClicked(event: MouseEvent) {
        const sidebarEl = document.querySelector('.layout-sidebar');
        const topbarEl = document.querySelector('.layout-menu-button');
        const eventTarget = event.target as Node;

        return !(
            sidebarEl?.isSameNode(eventTarget) ||
            sidebarEl?.contains(eventTarget) ||
            topbarEl?.isSameNode(eventTarget) ||
            topbarEl?.contains(eventTarget)
        );
    }

    hideMenu() {
        this.layoutService.layoutState.update((prev) => ({
            ...prev,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false
        }));

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }

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
            'layout-overlay': this.layoutService.layoutConfig().menuMode === 'overlay',
            'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
            'layout-static-inactive':
                this.layoutService.layoutState().staticMenuDesktopInactive &&
                this.layoutService.layoutConfig().menuMode === 'static',
            'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
            'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive
        };
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }
        // Restore previous menuMode
        if (this.previousMenuMode) {
            this.layoutService.layoutConfig.set({
                ...this.layoutService.layoutConfig(),
                menuMode: this.previousMenuMode
            });
        }
    }
}
