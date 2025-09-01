import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AvatarModule } from 'primeng/avatar';
import { FirebaseAuthService, UserProfile } from '../../services/firebase-auth.service';
import { UserService } from '../../services/user.service';
import { ImageUploadService } from '../../services/image-upload.service';
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
        ToastModule,
        ProgressSpinnerModule,
        AvatarModule
    ],
    template: `
        <div class="w-full">
            <div class="profile-update-container">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
                    <p class="text-gray-600">Please provide your information to get started</p>
                </div>

                @if (userProfile$ | async; as profile) {
                    <p-card styleClass="shadow-lg">
                        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
                            <!-- Profile Photo Section -->
                            <div class="text-center">
                                <div class="relative inline-block">
                                    <p-avatar 
                                        [image]="profileImageUrl || profile.profile_picture" 
                                        size="xlarge" 
                                        shape="circle"
                                        class="w-32 h-32 border-4 border-green-500">
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
                    </p-card>
                }

                @if (isSubmitting) {
                    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
                            <p-progressSpinner></p-progressSpinner>
                            <span class="text-gray-700">Saving your profile...</span>
                        </div>
                    </div>
                }
            </div>
        </div>

        <p-toast></p-toast>
    `,
    styles: [`
        .profile-update-container {
            width: 100%;
            min-height: calc(100vh - 4rem);
            box-sizing: border-box;
            padding: 1rem;
        }
        
        :host ::ng-deep .p-card {
            border-radius: 1rem;
        }
        
        :host ::ng-deep .p-inputtext {
            border-radius: 0.5rem;
        }
        
        :host ::ng-deep .p-button {
            border-radius: 0.5rem;
        }
        
        :host ::ng-deep .p-checkbox .p-checkbox-box {
            border-radius: 0.25rem;
        }
    `]
})
export class ProfileUpdateComponent implements OnInit, OnDestroy {
    userProfile$: Observable<UserProfile | null>;;
    profileForm: FormGroup;
    isSubmitting = false;
    profileImageUrl: string | null = null;
    selectedFile: File | null = null;
    private subscriptions = new Subscription();

    constructor(
        private fb: FormBuilder,
        private authService: FirebaseAuthService,
        private userService: UserService,
        private imageUploadService: ImageUploadService,
        private messageService: MessageService,
        private router: Router
    ) {
        this.userProfile$ = this.authService.userProfile$;
        this.profileForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            displayName: ['', [Validators.required, Validators.minLength(2)]],
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

    private populateForm(profile: UserProfile) {
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
            // Validate file
            const validation = this.imageUploadService.validateFile(file);
            if (!validation.isValid) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: validation.error || 'Invalid file'
                });
                return;
            }

            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.profileImageUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    async onSubmit() {
        if (this.profileForm.invalid) {
            this.markFormGroupTouched();
            return;
        }

        const formValue = this.profileForm.value;
        
        // Check if at least one interest is selected
        if (!formValue.interestPadel && !formValue.interestRunning) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please select at least one interest'
            });
            return;
        }

        this.isSubmitting = true;

        try {
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                throw new Error('No authenticated user found');
            }

            // Prepare interests array
            const interests: string[] = [];
            if (formValue.interestPadel) interests.push('padel');
            if (formValue.interestRunning) interests.push('running');

            // Update profile data
            const profileData = {
                firebase_uid: currentUser.uid,
                email: formValue.email,
                first_name: formValue.firstName,
                last_name: formValue.lastName,
                display_name: formValue.displayName,
                interests: interests,
                profile_completed: true
            };

            // Update user profile
            await this.userService.updateUserProfile(currentUser.uid, profileData).toPromise();

            // Handle profile picture upload if selected
            if (this.selectedFile) {
                const downloadURL = await this.uploadProfilePicture(this.selectedFile, currentUser.uid);
                
                // Update profile with new picture URL
                await this.userService.updateUserProfile(currentUser.uid, {
                    ...profileData,
                    profile_picture: downloadURL
                }).toPromise();
            }

            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Profile updated successfully!'
            });

            // Navigate to dashboard after successful update
            setTimeout(() => {
                this.router.navigate(['/player']);
            }, 1500);

        } catch (error: any) {
            console.error('Error updating profile:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to update profile. Please try again.'
            });
        } finally {
            this.isSubmitting = false;
        }
    }

    private async uploadProfilePicture(file: File, userId: string): Promise<string> {
        return firstValueFrom(this.imageUploadService.uploadProfilePicture(file, userId));
    }

    private markFormGroupTouched() {
        Object.keys(this.profileForm.controls).forEach(key => {
            const control = this.profileForm.get(key);
            control?.markAsTouched();
        });
    }
}
