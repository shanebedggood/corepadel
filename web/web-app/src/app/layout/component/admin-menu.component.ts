import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-admin-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
    <ul class="layout-menu">
      @for (item of model; track item; let i = $index) {
        @if (!item.separator) {
          <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
        }
        @if (item.separator) {
          <li class="menu-separator"></li>
        }
      }
    </ul>
  `
})
export class AdminMenu implements OnInit {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = this.buildMenuItems();
    }

    private buildMenuItems(): MenuItem[] {
        return [
            {
                label: 'Admin Dashboard',
                items: [
                    {
                        label: 'Overview',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/admin']
                    },
                    {
                        label: 'Setup',
                        icon: 'pi pi-fw pi-cog',
                        routerLink: ['/admin/setup']
                    }
                ]
            },
            {
                label: 'Tournament Management',
                items: [
                    {
                        label: 'Tournaments',
                        icon: 'pi pi-fw pi-trophy',
                        routerLink: ['/admin/tournaments']
                    },
                    {
                        label: 'Court Schedules',
                        icon: 'pi pi-fw pi-calendar-clock',
                        routerLink: ['/admin/court-schedules']
                    }
                ]
            },
            {
                label: 'User Management',
                items: [
                    {
                        label: 'All Users',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/admin/users']
                    },
                    {
                        label: 'Role Management',
                        icon: 'pi pi-fw pi-shield',
                        routerLink: ['/admin/roles']
                    }
                ]
            },
            {
                label: 'System',
                items: [
                    {
                        label: 'Settings',
                        icon: 'pi pi-fw pi-cog',
                        routerLink: ['/admin/settings']
                    },
                    {
                        label: 'Test Roles',
                        icon: 'pi pi-fw pi-wrench',
                        routerLink: ['/admin/test-roles']
                    }
                ]
            }
        ];
    }
}
