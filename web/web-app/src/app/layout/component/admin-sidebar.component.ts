import { Component, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminMenu } from './admin-menu.component';
import { LayoutService } from '../service/layout.service';

@Component({
    selector: 'app-admin-sidebar',
    standalone: true,
    imports: [CommonModule, AdminMenu],
    template: `
        <div class="layout-sidebar admin-sidebar" [ngClass]="sidebarClass">
            <app-admin-menu></app-admin-menu>
        </div>
    `,
    styles: [`
        .layout-sidebar.admin-sidebar {
            position: fixed !important;
            height: calc(100vh - 4rem) !important;
            z-index: 1000 !important;
            overflow-y: auto;
            user-select: none;
            top: 4rem !important;
            left: 0 !important;
            transition: transform 0.3s ease;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
            border-right: 1px solid #93c5fd;
            width: 16rem !important;
            border-radius: 0 !important;
            padding: 0.5rem 1.5rem;
            box-sizing: border-box !important;
        }

        .layout-sidebar.admin-sidebar::-webkit-scrollbar {
            width: 6px;
        }

        .layout-sidebar.admin-sidebar::-webkit-scrollbar-track {
            background: #dbeafe;
        }

        .layout-sidebar.admin-sidebar::-webkit-scrollbar-thumb {
            background: #93c5fd;
            border-radius: 3px;
        }

        .layout-sidebar.admin-sidebar::-webkit-scrollbar-thumb:hover {
            background: #60a5fa;
        }

        /* Static layout behavior */
        .layout-wrapper.layout-static .layout-sidebar.admin-sidebar {
            transform: translateX(0);
        }

        .layout-wrapper.layout-static.layout-static-inactive .layout-sidebar.admin-sidebar {
            transform: translateX(-100%);
        }

        @media screen and (max-width: 991px) {
            .layout-sidebar.admin-sidebar {
                position: fixed !important;
                transform: translateX(-100%);
                width: 100% !important;
                top: 0 !important;
                height: 100vh !important;
            }

            .layout-sidebar.admin-sidebar.layout-sidebar-active {
                transform: translateX(0);
            }
        }
    `]
})
export class AdminSidebar {
    constructor(public el: ElementRef, public layoutService: LayoutService) {}

    get sidebarClass() {
        return {
            'layout-sidebar-active': this.isStaticActive(),
            'layout-sidebar-inactive': !this.isStaticActive()
        };
    }

    isStaticActive() {
        return !this.layoutService.layoutState().staticMenuDesktopInactive;
    }
}
