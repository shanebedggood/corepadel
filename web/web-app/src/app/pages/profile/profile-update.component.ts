import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AvatarModule } from 'primeng/avatar';
import { PageHeaderComponent } from '../../layout/component/page-header.component';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { UserService } from '../../services/user.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { UserProfile } from '../../services/firebase-auth.service';
import { Observable, Subscription, firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-profile-update',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        CheckboxModule,
        ProgressSpinnerModule,
        AvatarModule,
        PageHeaderComponent
    ],
    template: `
        <div class="card">
            <!-- Page Header -->
            <app-page-header 
                title="Complete Your Profile"
                subtitle="Please provide your information to get started"
                [breadcrumbs]="breadcrumbs">
            </app-page-header>
            
            <!-- Page Content -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                @if (userProfile$ | async; as profile) {
                    <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
                        <!-- Profile Photo Section -->
                        <div class="text-center">
                            <div class="relative inline-block">
                                <p-avatar 
                                    [image]="profileImageUrl || profile.profile_picture" 
                                    [label]="!(profileImageUrl || profile.profile_picture) ? getUserInitials(profile) : undefined"
                                    size="xlarge" 
                                    shape="circle"
                                    class="large-profile-avatar">
                                </p-avatar>
                                <button 
                                    type="button"
                                    class="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition-colors"
                                    (click)="fileInput.click()">
                                    <i class="pi pi-camera"></i>
                                </button>
                            </div>
                            <input 
                                #fileInput
                                type="file" 
                                accept="image/*" 
                                class="hidden" 
                                (change)="onFileSelected($event)">
                            <p class="text-sm text-gray-500 mt-2">Click to upload a profile photo</p>
                        </div>

                        <!-- Name Fields -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
                                    First Name *
                                </label>
                                <input 
                                    id="firstName"
                                    type="text" 
                                    pInputText 
                                    formControlName="firstName"
                                    class="w-full"
                                    placeholder="Enter your first name">
                                @if (profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched) {
                                    <small class="text-red-500">First name is required</small>
                                }
                            </div>

                            <div>
                                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name *
                                </label>
                                <input 
                                    id="lastName"
                                    type="text" 
                                    pInputText 
                                    formControlName="lastName"
                                    class="w-full"
                                    placeholder="Enter your last name">
                                @if (profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched) {
                                    <small class="text-red-500">Last name is required</small>
                                }
                            </div>
                        </div>

                        <!-- Display Name -->
                        <div>
                            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">
                                Display Name *
                            </label>
                            <input 
                                id="displayName"
                                type="text" 
                                pInputText 
                                formControlName="displayName"
                                class="w-full"
                                placeholder="Enter your display name">
                            @if (profileForm.get('displayName')?.invalid && profileForm.get('displayName')?.touched) {
                                <small class="text-red-500">Display name is required</small>
                            }
                        </div>

                        <!-- Email -->
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <input 
                                id="email"
                                type="email" 
                                pInputText 
                                formControlName="email"
                                class="w-full"
                                placeholder="Enter your email address"
                                [readonly]="true">
                            <small class="text-gray-500">Email cannot be changed</small>
                        </div>

                        <!-- Interests -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-3">
                                Interests *
                            </label>
                            <div class="space-y-2">
                                <div class="flex items-center">
                                    <p-checkbox 
                                        formControlName="interestPadel" 
                                        [binary]="true"
                                        inputId="interestPadel">
                                    </p-checkbox>
                                    <label for="interestPadel" class="ml-2 text-sm text-gray-700">
                                        Padel
                                    </label>
                                </div>
                                <div class="flex items-center">
                                    <p-checkbox 
                                        formControlName="interestRunning" 
                                        [binary]="true"
                                        inputId="interestRunning">
                                    </p-checkbox>
                                    <label for="interestRunning" class="ml-2 text-sm text-gray-700">
                                        Running
                                    </label>
                                </div>
                            </div>
                            @if (profileForm.get('interestPadel')?.value === false && profileForm.get('interestRunning')?.value === false && profileForm.get('interestPadel')?.touched) {
                                <small class="text-red-500">Please select at least one interest</small>
                            }
                        </div>

                        <!-- Submit Button -->
                        <div class="flex justify-end">
                            <button 
                                type="submit"
                                pButton 
                                label="Save Profile" 
                                [disabled]="profileForm.invalid || isSubmitting"
                                [loading]="isSubmitting">
                            </button>
                        </div>
                    </form>
                }

            </div>
        </div>

    `,
    styles: [`
        :host ::ng-deep .p-inputtext {
            border-radius: 0.5rem;
        }
        
        :host ::ng-deep .p-button {
            border-radius: 0.5rem;
        }
        
        :host ::ng-deep .p-checkbox .p-checkbox-box {
            border-radius: 0.25rem;
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
    `]
})
export class ProfileUpdateComponent implements OnInit, OnDestroy {
    userProfile$: Observable<UserProfile | null>;
    profileForm: FormGroup;
    profileImageUrl: string | null = null;
    isSubmitting = false;
    private subscriptions = new Subscription();
    
    // Page header configuration
    breadcrumbs = [
        { label: 'Home', route: '/player', icon: 'pi pi-home' },
        { label: 'My Profile', route: '/player/profile', icon: 'pi pi-user' },
        { label: 'Update Profile' }
    ];

    constructor(
        private fb: FormBuilder,
        private authService: FirebaseAuthService,
        private userService: UserService,
        private imageUploadService: ImageUploadService,
        private errorHandlerService: ErrorHandlerService,
        private router: Router
    ) {
        this.userProfile$ = this.authService.userProfile$;
        
        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            displayName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            interestPadel: [false],
            interestRunning: [false]
        });
    }

    ngOnInit() {
        this.subscriptions.add(
            this.userProfile$.subscribe(profile => {
                if (profile) {
                    this.populateForm(profile);
                }
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    populateForm(profile: UserProfile) {
        this.profileForm.patchValue({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            displayName: profile.display_name || '',
            email: profile.email || '',
            interestPadel: profile.interests?.includes('padel') || false,
            interestRunning: profile.interests?.includes('running') || false
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.uploadImage(file);
        }
    }

    async uploadImage(file: File) {
        try {
            this.isSubmitting = true;
            const profile = await firstValueFrom(this.userProfile$);
            
            if (!profile) {
                throw new Error('No user profile found');
            }
            
            const imageUrl = await firstValueFrom(this.imageUploadService.uploadProfilePicture(file, profile.firebaseUid));
            this.profileImageUrl = imageUrl;
            
            // Update the profile immediately with the new image URL
            const profileData = {
                profile_picture: imageUrl
            };
            
            await firstValueFrom(this.userService.updateUserProfile(profile.firebaseUid, profileData));
            
            // Refresh the user profile to show the updated image
            await this.authService.loadUserProfile();
            
            this.errorHandlerService.handleSuccess('Profile image uploaded and saved successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            this.errorHandlerService.handleApiError(error, 'Profile Image Upload');
        } finally {
            this.isSubmitting = false;
        }
    }

    async onSubmit() {
        if (this.profileForm.valid) {
            try {
                this.isSubmitting = true;
                const profile = await firstValueFrom(this.userProfile$);
                
                if (!profile) {
                    throw new Error('No user profile found');
                }

                const interests = [];
                if (this.profileForm.get('interestPadel')?.value) {
                    interests.push('padel');
                }
                if (this.profileForm.get('interestRunning')?.value) {
                    interests.push('running');
                }

                const profileData: any = {
                    first_name: this.profileForm.get('firstName')?.value,
                    last_name: this.profileForm.get('lastName')?.value,
                    display_name: this.profileForm.get('displayName')?.value,
                    interests: interests,
                    profile_completed: true
                };

                if (this.profileImageUrl) {
                    profileData.profile_picture = this.profileImageUrl;
                }

                await firstValueFrom(this.userService.updateUserProfile(profile.firebaseUid, profileData));

                // Refresh the user profile to show the updated data
                await this.authService.loadUserProfile();

                this.errorHandlerService.handleSuccess('Profile updated successfully!');

                // Redirect to profile page after a short delay
                setTimeout(() => {
                    this.router.navigate(['/player/profile']);
                }, 1500);

            } catch (error) {
                console.error('Error updating profile:', error);
                this.errorHandlerService.handleApiError(error, 'Profile Update');
            } finally {
                this.isSubmitting = false;
            }
        }
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
}
