import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FirebaseAuthService, UserProfile } from '../../services/firebase-auth.service';
import { Observable, map } from 'rxjs';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    template: `
        <div class="admin-dashboard">
            <div class="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome to the admin panel</p>
            </div>
            
            <div class="admin-content">
                <div class="admin-cards">
                    <p-card header="User Management" styleClass="admin-card">
                        <p>Manage users, roles, and permissions</p>
                        <button pButton type="button" label="Manage Users" icon="pi pi-users" class="p-button-primary"></button>
                    </p-card>
                    
                    <p-card header="Tournament Management" styleClass="admin-card">
                        <p>Create and manage tournaments</p>
                        <button pButton type="button" label="Manage Tournaments" icon="pi pi-trophy" class="p-button-primary"></button>
                    </p-card>
                    
                    <p-card header="System Settings" styleClass="admin-card">
                        <p>Configure system settings and preferences</p>
                        <button pButton type="button" label="Settings" icon="pi pi-cog" class="p-button-primary"></button>
                    </p-card>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .admin-dashboard {
            padding: 2rem;
        }
        
        .admin-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .admin-header h1 {
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .admin-content {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .admin-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .admin-card {
            height: 100%;
        }
        
        .admin-card ::ng-deep .p-card-body {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        
        .admin-card ::ng-deep .p-card-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
    `]
})
export class AdminComponent implements OnInit {
    isAdmin$: Observable<boolean>;
    userProfile$: Observable<UserProfile | null>;

    constructor(
        private authService: FirebaseAuthService,
        private router: Router
    ) {
        this.isAdmin$ = this.authService.userProfile$.pipe(
            map(profile => profile?.roles.includes('admin') || false)
        );
        this.userProfile$ = this.authService.userProfile$;
    }

    ngOnInit() {
        // Verify admin access
        this.isAdmin$.subscribe(isAdmin => {
            if (!isAdmin) {
                this.router.navigate(['/choose-role']);
            }
        });
    }
} 