import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Observable, map } from 'rxjs';

@Component({
    selector: 'app-test-roles',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    template: `
        <div class="test-roles-container">
            <div class="test-header">
                <h1>Role Testing</h1>
                <p>Test your current roles and permissions</p>
            </div>
            
            <div class="test-content">
                <p-card header="Current User Information" styleClass="test-card">
                    <div class="user-info" *ngIf="userProfile$ | async as profile">
                        <p><strong>Name:</strong> {{ profile.firstName }} {{ profile.lastName }}</p>
                        <p><strong>Email:</strong> {{ profile.email }}</p>
                        <p><strong>Username:</strong> {{ profile.username }}</p>
                    </div>
                </p-card>
                
                <p-card header="Role Information" styleClass="test-card">
                    <div class="role-info">
                        <p><strong>Has Player Role:</strong> {{ (hasPlayerRole$ | async) ? 'Yes' : 'No' }}</p>
                        <p><strong>Has Admin Role:</strong> {{ (hasAdminRole$ | async) ? 'Yes' : 'No' }}</p>
                        <p><strong>All Roles:</strong></p>
                        <div class="roles-list">
                            <span *ngFor="let role of userRoles$ | async" class="role-badge">{{ role }}</span>
                        </div>
                    </div>
                </p-card>
                
                <p-card header="Access Testing" styleClass="test-card">
                    <div class="access-tests">
                        <button pButton type="button" 
                                label="Test Player Access" 
                                icon="pi pi-user" 
                                class="p-button-primary"
                                (click)="testPlayerAccess()">
                        </button>
                        <button pButton type="button" 
                                label="Test Admin Access" 
                                icon="pi pi-shield" 
                                class="p-button-warning"
                                (click)="testAdminAccess()">
                        </button>
                    </div>
                </p-card>
            </div>
        </div>
    `,
    styles: [`
        .test-roles-container {
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .test-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .test-header h1 {
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .test-content {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        
        .test-card {
            margin-bottom: 1rem;
        }
        
        .user-info, .role-info {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .roles-list {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-top: 0.5rem;
        }
        
        .role-badge {
            background-color: var(--primary-color);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.875rem;
        }
        
        .access-tests {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
    `]
})
export class TestRolesComponent implements OnInit {
    userProfile$: Observable<any>;
    userRoles$: Observable<string[]>;
    hasPlayerRole$: Observable<boolean>;
    hasAdminRole$: Observable<boolean>;

    constructor(
        private authService: FirebaseAuthService
    ) {
        this.userProfile$ = this.authService.getCurrentUserProfile();
        this.userRoles$ = this.authService.getUserRoles();
        this.hasPlayerRole$ = this.authService.hasRole('player');
        this.hasAdminRole$ = this.authService.hasRole('admin');
    }

    ngOnInit() {
        // Component initialization
    }

    testPlayerAccess() {
        this.hasPlayerRole$.subscribe(hasPlayer => {
            if (hasPlayer) {
                alert('✅ Player access granted!');
            } else {
                alert('❌ Player access denied!');
            }
        });
    }

    testAdminAccess() {
        this.hasAdminRole$.subscribe(hasAdmin => {
            if (hasAdmin) {
                alert('✅ Admin access granted!');
            } else {
                alert('❌ Admin access denied!');
            }
        });
    }
}
