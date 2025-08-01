import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppMenu {
    constructor(private authService: FirebaseAuthService) {}

    getMenuItems(): Observable<MenuItem[]> {
        return this.authService.getUserRoles().pipe(
            map(roles => {
                const menuItems: MenuItem[] = [];

                // Add menu items based on user roles
                if (roles.includes('player')) {
                    menuItems.push(
                        {
                            label: 'Dashboard',
                            icon: 'pi pi-home',
                            routerLink: '/player'
                        },
                        {
                            label: 'Tournaments',
                            icon: 'pi pi-trophy',
                            routerLink: '/player/tournaments'
                        },
                        {
                            label: 'Profile',
                            icon: 'pi pi-user',
                            routerLink: '/player/profile'
                        }
                    );
                }

                if (roles.includes('admin')) {
                    menuItems.push(
                        {
                            label: 'Admin Dashboard',
                            icon: 'pi pi-shield',
                            routerLink: '/admin'
                        },
                        {
                            label: 'Tournament Management',
                            icon: 'pi pi-cog',
                            routerLink: '/admin/tournaments'
                        },
                        {
                            label: 'User Management',
                            icon: 'pi pi-users',
                            routerLink: '/admin/users'
                        }
                    );
                }

                return menuItems;
            })
        );
    }
}
