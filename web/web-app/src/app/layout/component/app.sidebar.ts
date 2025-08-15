import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';
import { LayoutService } from '../service/layout.service';
import { Observable, Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { AppMenu } from './app.menu';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <div class="layout-sidebar" [ngClass]="containerClass">
            <div class="layout-menu-container">
                <ul class="layout-menu">
                    @for (item of menuItems$ | async; track item; let i = $index) {
                        @if (!item.separator) {
                            <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
                        }
                        @if (item.separator) {
                            <li class="menu-separator"></li>
                        }
                    }
                </ul>
            </div>
        </div>
    `,
    styles: []
})
export class AppSidebar implements OnInit, OnDestroy {
    menuItems$: Observable<MenuItem[]>;
    private subscriptions: Subscription = new Subscription();

    constructor(
        public layoutService: LayoutService,
        private appMenu: AppMenu
    ) {
        this.menuItems$ = this.appMenu.getMenuItems();
    }

    ngOnInit() {
        // Component initialization
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    get containerClass() {
        return {
            'layout-sidebar': true,
            'layout-sidebar-active': this.layoutService.isSidebarActive()
        };
    }
}
