import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { UserProfile } from '../../services/firebase-auth.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    template: `
        <div class="profile-container">
            <div class="profile-header">
                <h1>User Profile</h1>
            </div>
            
            @if (userProfile$ | async; as profile) {
                <div class="profile-content">
                    <p-card header="Profile Information" styleClass="profile-card">
                        <div class="profile-info">
                            <div class="info-row">
                                <label>Name:</label>
                                <span>{{ profile.firstName || profile.first_name || profile.displayName || profile.username || 'Not provided' }}</span>
                            </div>
                            <div class="info-row">
                                <label>Email:</label>
                                <span>{{ profile.email }}</span>
                            </div>
                            <div class="info-row">
                                <label>Username:</label>
                                <span>{{ profile.username }}</span>
                            </div>
                            <div class="info-row">
                                <label>Email Verified:</label>
                                <span>{{ (profile.emailVerified || profile.email_verified) ? 'Yes' : 'No' }}</span>
                            </div>
                            <div class="info-row">
                                <label>Roles:</label>
                                <div class="roles-list">
                                    @for (role of profile.roles; track role) {
                                        <span class="role-badge">{{ role }}</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </p-card>
                </div>
            }
        </div>
    `,
    styles: [`
        .profile-container {
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .profile-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .profile-header h1 {
            color: var(--primary-color);
        }
        
        .profile-card {
            margin-bottom: 2rem;
        }
        
        .profile-info {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .info-row {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .info-row label {
            font-weight: bold;
            min-width: 120px;
        }
        
        .roles-list {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .role-badge {
            background-color: var(--primary-color);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.875rem;
        }
    `]
})
export class ProfileComponent implements OnInit {
    userProfile$: Observable<UserProfile | null>;

    constructor(private authService: FirebaseAuthService) {
        this.userProfile$ = this.authService.userProfile$;
    }

    ngOnInit() {
        // Component initialization
    }
}
