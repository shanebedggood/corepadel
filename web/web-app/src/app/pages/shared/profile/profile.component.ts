import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { UserProfile } from '../../../services/firebase-auth.service';
import { ImageUploadService } from '../../../services/image-upload.service';
import { Observable, map, switchMap } from 'rxjs';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, AvatarModule],
    styleUrls: ['../../../shared/styles/container.styles.scss', '../../../shared/styles/button.styles.scss'],
    template: `
        <div class="container-base p-4">
            <div class="card">
                <div class="font-semibold text-xl mb-1">My Profile</div>
                <p class="text-gray-600 mb-4">View and manage your profile information</p>
                
                @if (userProfile$ | async; as profile) {
                    <div class="profile-content">
                        <!-- Profile Photo -->
                        <div class="profile-photo-section text-center mb-6">
                            <p-avatar 
                                [image]="(cachedProfileImage$ | async) || undefined" 
                                [label]="!(cachedProfileImage$ | async) ? getUserInitials(profile) : undefined"
                                size="xlarge" 
                                shape="circle"
                                class="large-profile-avatar">
                            </p-avatar>
                        </div>

                        <!-- Profile Information Grid -->
                        <div class="profile-info-grid">
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
                                <label>Playtomic Rating:</label>
                                <span>{{ getPlaytomicRating(profile) }}</span>
                            </div>
                            <div class="info-row full-width">
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
                            <div class="info-row full-width">
                                <label>Roles:</label>
                                <div class="roles-list">
                                    @for (role of profile.roles; track role) {
                                        <span class="role-badge" [ngClass]="getRoleBadgeClass(role)">{{ role }}</span>
                                    }
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-actions mt-6 text-center">
                            <button 
                                pButton 
                                label="Edit Profile" 
                                icon="pi pi-pencil"
                                (click)="editProfile()">
                            </button>
                        </div>
                    </div>
                }
            </div>
        </div>
    `,
    styles: [`
        .profile-content {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .profile-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            align-items: start;
        }
        
        .info-row {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.75rem 0;
        }
        
        .info-row.full-width {
            grid-column: 1 / -1;
        }
        
        .info-row label {
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .info-row span {
            color: #1f2937;
            font-size: 1rem;
            font-weight: 500;
        }
        
        .roles-list {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .role-badge {
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 1rem;
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .role-badge-admin {
            background-color: #d1d5db !important; /* gray-300 */
            color: #374151 !important; /* gray-700 */
        }
        
        .role-badge-player {
            background-color: #d1d5db !important; /* gray-300 */
            color: #374151 !important; /* gray-700 */
        }
        
        .role-badge-default {
            background-color: #d1d5db !important; /* gray-300 */
            color: #374151 !important; /* gray-700 */
        }
        
        ::ng-deep .role-badge-admin {
            background-color: #d1d5db !important; /* gray-300 */
            color: #374151 !important; /* gray-700 */
        }
        
        ::ng-deep .role-badge-player {
            background-color: #d1d5db !important; /* gray-300 */
            color: #374151 !important; /* gray-700 */
        }
        
        ::ng-deep .role-badge-default {
            background-color: #d1d5db !important; /* gray-300 */
            color: #374151 !important; /* gray-700 */
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
            font-weight: 500;
        }
        
        .large-profile-avatar {
            width: 8rem !important;
            height: 8rem !important;
            font-size: 2rem !important;
            border: 4px solid #10b981 !important;
        }
        
        .large-profile-avatar ::ng-deep .p-avatar {
            width: 8rem !important;
            height: 8rem !important;
            font-size: 2rem !important;
        }
        
        .large-profile-avatar ::ng-deep .p-avatar img {
            width: 8rem !important;
            height: 8rem !important;
            object-fit: cover;
        }
        
        .profile-actions {
            border-top: 1px solid #e5e7eb;
            padding-top: 1.5rem;
        }
        
        // Responsive adjustments - work with shared container styles
        @media (max-width: 768px) {
            .card {
                padding: 1rem;
                margin-bottom: 0.5rem;
                border-radius: 0.375rem;
            }
            
            .profile-info-grid {
                grid-template-columns: 1fr;
                gap: 0.75rem;
            }
            
            .info-row {
                padding: 0.5rem 0;
            }
            
            .large-profile-avatar {
                width: 6rem !important;
                height: 6rem !important;
                font-size: 1.5rem !important;
            }
            
            .large-profile-avatar ::ng-deep .p-avatar {
                width: 6rem !important;
                height: 6rem !important;
                font-size: 1.5rem !important;
            }
            
            .large-profile-avatar ::ng-deep .p-avatar img {
                width: 6rem !important;
                height: 6rem !important;
            }
        }
        
        @media (max-width: 480px) {
            .card {
                padding: 0.75rem;
                border-radius: 0.25rem;
            }
            
            .profile-content {
                gap: 1rem;
            }
            
            .info-row label {
                font-size: 0.75rem;
            }
            
            .info-row span {
                font-size: 0.875rem;
            }
        }
    `]
})
export class ProfileComponent implements OnInit {
    userProfile$: Observable<UserProfile | null>;
    cachedProfileImage$: Observable<string | null>;

    constructor(
        private authService: FirebaseAuthService,
        private imageUploadService: ImageUploadService,
        private router: Router
    ) {
        this.userProfile$ = this.authService.userProfile$;
        
        // Create cached image observable
        this.cachedProfileImage$ = this.userProfile$.pipe(
            switchMap(profile => {
                if (profile) {
                    return this.imageUploadService.getCachedProfileImage(profile.firebaseUid, profile.profile_picture);
                }
                return new Observable<string | null>(observer => {
                    observer.next(null);
                    observer.complete();
                });
            })
        );
    }

    ngOnInit() {
        // Refresh the profile data when the component loads
        this.authService.loadUserProfile();
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

    getPlaytomicRating(profile: any): string {
        return profile.playtomic_rating ? profile.playtomic_rating.toFixed(2) : 'Not set';
    }

    getUserInitials(profile: any): string {
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        
        if (firstName && lastName) {
            return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        } else if (firstName) {
            return firstName.charAt(0).toUpperCase();
        } else if (lastName) {
            return lastName.charAt(0).toUpperCase();
        } else {
            // Fallback to email initials if no name is available
            const email = profile.email || '';
            const emailParts = email.split('@')[0];
            return emailParts.charAt(0).toUpperCase();
        }
    }

    getRoleBadgeClass(role: string): string {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'role-badge-admin';
            case 'player':
                return 'role-badge-player';
            default:
                return 'role-badge-default';
        }
    }
}
