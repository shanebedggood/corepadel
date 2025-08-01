import { Component, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminMenu } from './admin-menu.component';
import { LayoutService } from '../service/layout.service';

@Component({
    selector: 'app-admin-sidebar',
    standalone: true,
    imports: [CommonModule, AdminMenu],
    template: `
        <div class="layout-sidebar admin-sidebar">
            <app-admin-menu></app-admin-menu>
        </div>
    `,
    styles: [`
        .layout-sidebar.admin-sidebar {
            position: fixed !important;
            height: 100vh !important;
            z-index: 1000 !important;
            overflow-y: auto;
            user-select: none;
            top: 0 !important;
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
    `]
})
export class AdminSidebar {
    constructor(public el: ElementRef, public layoutService: LayoutService) {}
}
