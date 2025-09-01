import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { UserProfile } from '../../services/firebase-auth.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, AvatarModule],
    template: `
        <div class="w-full">
            <div class="profile-container">
                <div class="profile-header">
                    <h1>My Profile</h1>
                </div>
                
                @if (userProfile$ | async; as profile) {
                    <div class="profile-content">
                        <p-card header="Profile Information" styleClass="profile-card">
                            <div class="profile-info">
                                <!-- Profile Photo -->
                                <div class="profile-photo-section text-center mb-6">
                                    <p-avatar 
                                        [image]="profile.profile_picture" 
                                        size="xlarge" 
                                        shape="circle"
                                        class="w-32 h-32 border-4 border-green-500">
                                    </p-avatar>
                                </div>

                                <div class="info-row">
                                    <label>First Name:</label>
                                    <span>{{ getFirstName(profile) }}</span>
                                </div>
                                <div class="info-row">
                                    <label>Last Name:</label>
                                    <span>{{ getLastName(profile) }}</span>
                                </div>
                                <div class="info-row">
                                    <label>Display Name:</label>
                                    <span>{{ getDisplayName(profile) }}</span>
                                </div>
                                <div class="info-row">
                                    <label>Email:</label>
                                    <span>{{ profile.email }}</span>
                                </div>
                                <div class="info-row">
                                    <label>Email Verified:</label>
                                    <span>{{ profile.email_verified ? 'Yes' : 'No' }}</span>
                                </div>
                                <div class="info-row">
                                    <label>Interests:</label>
                                    <div class="interests-list">
                                        @if (profile.interests && profile.interests.length > 0) {
                                            @for (interest of profile.interests; track interest) {
                                                <span class="interest-badge">{{ interest }}</span>
                                            }
                                        } @else {
                                            <span class="text-gray-500">No interests selected</span>
                                        }
                                    </div>
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
                            
                            <div class="profile-actions mt-6 text-center">
                                <button 
                                    pButton 
                                    label="Edit Profile" 
                                    icon="pi pi-pencil"
                                    class="p-button-primary"
                                    (click)="editProfile()">
                                </button>
                            </div>
                        </p-card>
                    </div>
                }
            </div>
        </div>
    `,
    styles: [`
        .profile-container {
            width: 100%;
            min-height: calc(100vh - 4rem);
            box-sizing: border-box;
        }
        
        .profile-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .profile-header h1 {
            color: var(--primary-color);
            font-size: 2rem;
            font-weight: bold;
        }
        
        .profile-content {
            padding: 0;
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
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .info-row label {
            font-weight: bold;
            min-width: 120px;
            color: #374151;
        }
        
        .info-row span {
            color: #1f2937;
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
        
        .interests-list {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .interest-badge {
            background-color: var(--green-500);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.875rem;
            text-transform: capitalize;
        }
    `]
})
export class ProfileComponent {
    userProfile$: Observable<UserProfile | null>;

    constructor(
        private authService: FirebaseAuthService,
        private router: Router
    ) {
        this.userProfile$ = this.authService.userProfile$;
    }

    editProfile() {
        this.router.navigate(['/player/profile/update']);
    }

    getFirstName(profile: any): string {
        return profile.first_name || 'Not provided';
    }

    getLastName(profile: any): string {
        return profile.last_name || 'Not provided';
    }

    getDisplayName(profile: any): string {
        return profile.display_name || 'Not provided';
    }
}
