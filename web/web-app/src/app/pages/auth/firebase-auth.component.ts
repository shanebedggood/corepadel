import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { FirebaseAuthService } from '../../services/firebase-auth.service';

@Component({
  selector: 'app-firebase-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    DividerModule,
    ProgressSpinnerModule,
  ],
  template: `
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden relative">
      <!-- Background Image -->
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          [style.background-image]="'url(' + backgroundImageUrl + ')'">
      </div>
      <div class="flex flex-col items-center justify-center relative z-10 w-full px-4 sm:px-6 opacity-100">
        <div class="w-full max-w-md sm:max-w-lg lg:max-w-xl bg-surface-0/90 dark:bg-surface-900/90 py-12 sm:py-16 lg:py-20 px-6 sm:px-12 lg:px-20 relative" style="border-radius: 50px">
          <div class="text-center mb-8">
            <img src="assets/logo.png" alt="STRIDE & SERVE Logo" class="mb-8 w-32 shrink-0 mx-auto" />
            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
              {{ getTitleText() }}
            </div>
            <span class="text-surface-600 dark:text-surface-400 text-md">
              {{ getDescriptionText() }}
            </span>
          </div>

        <!-- Email Input Form -->
        @if (!isSignInLinkValid && !emailSent) {
          <form (ngSubmit)="sendSignInLink()" #signInForm="ngForm" class="w-full max-w-[30rem] mx-auto">
          
          <!-- Sign-up specific fields -->
          @if (isSignUpMode) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="name" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  [(ngModel)]="name"
                  required
                  pInputText
                  class="w-full"
                  placeholder="First name"
                  [disabled]="loading"
                />
              </div>
              <div>
                <label for="surname" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Surname
                </label>
                <input
                  id="surname"
                  type="text"
                  name="surname"
                  [(ngModel)]="surname"
                  required
                  pInputText
                  class="w-full"
                  placeholder="Last name"
                  [disabled]="loading"
                />
              </div>
            </div>
            <div class="mb-4">
              <label for="mobile" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Mobile
              </label>
              <input
                id="mobile"
                type="tel"
                name="mobile"
                [(ngModel)]="mobile"
                required
                pInputText
                class="w-full"
                placeholder="Mobile number"
                [disabled]="loading"
              />
            </div>
          }

          <div class="mb-6">
            <label for="email" class="block text-md font-medium text-surface-700 dark:text-surface-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              email
              pInputText
              class="w-full"
              placeholder="Enter your email address"
              [disabled]="loading"
            />
          </div>

          <div class="flex justify-between items-center gap-4">
            <p-button
              type="submit"
              label="{{ getButtonText() }}"
              icon="pi pi-envelope"
              [loading]="loading"
              [disabled]="!signInForm.form.valid || loading"
            ></p-button>
            <a 
              routerLink="/"
              class="flex items-center gap-2 text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100 transition-colors duration-200"
            >
              <i class="pi pi-home"></i>
              <span>Back to Home</span>
            </a>
          </div>

        </form>
        }

        <!-- Toggle between Sign-in and Sign-up -->
        @if (!isSignInLinkValid && !emailSent) {
          <div class="text-center mt-6">
            <p class="text-surface-500 dark:text-surface-400 text-md">
              {{ isSignUpMode ? 'Already have an account?' : 'New to STRIDE & SERVE?' }}
              <a 
                [routerLink]="isSignUpMode ? '/auth' : '/auth/signup'"
                class="text-primary-color !underline hover:!no-underline ml-1"
              >
                {{ isSignUpMode ? 'Sign in' : 'Create account' }}
              </a>
            </p>
          </div>
        }

        <!-- Email Sent Confirmation -->
        @if (emailSent) {
          <div class="text-center w-full max-w-[30rem] mx-auto">
          <i class="pi pi-check-circle text-6xl text-green-500 mb-4"></i>
          <h2 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">Check Your Email</h2>
          <p class="text-surface-600 dark:text-surface-400 mb-4">
            We've sent a secure {{ isSignUpMode ? 'sign-up' : 'sign-in' }} link to <strong>{{ email }}</strong>
          </p>
          <p class="text-sm text-surface-500 dark:text-surface-400 mb-4">
            Click the link in your email to {{ isSignUpMode ? 'complete your registration' : 'sign in' }} to STRIDE & SERVE. No password required!
          </p>
          
          <p-divider></p-divider>
          
          <p class="text-sm text-surface-500 dark:text-surface-400 mb-4">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          
          <p-button
            label="Send Another Link"
            icon="pi pi-refresh"
            severity="secondary"
            (onClick)="resetForm()"
            [disabled]="loading"
          ></p-button>
        </div>
        }

        <!-- Sign-In Link Processing -->
        @if (isSignInLinkValid) {
          <div class="text-center w-full max-w-[30rem] mx-auto">
                      @if (processingLink) {
              <p-progressSpinner></p-progressSpinner>
            }
            @if (!processingLink) {
              <div>
            <i class="pi pi-link text-6xl text-blue-500 mb-4"></i>
            <h2 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">Completing Sign-In</h2>
            <p class="text-surface-600 dark:text-surface-400 mb-4">
              Please wait while we complete your sign-in...
            </p>
          </div>
        }
        </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class FirebaseAuthComponent implements OnInit {
  backgroundImageUrl: string = 'assets/images/large/hero.webp';
  email: string = '';
  name: string = '';
  surname: string = '';
  mobile: string = '';
  loading: boolean = false;
  emailSent: boolean = false;
  processingLink: boolean = false;
  isSignInLinkValid: boolean = false;
  isSignUpMode: boolean = false;

  constructor(
    private firebaseAuth: FirebaseAuthService,
    private router: Router,
    private errorHandlerService: ErrorHandlerService
  ) { }

  ngOnInit() {
    // Check if this is a sign-in link using a safer approach
    this.checkSignInLink();
    
    // Check if we're in sign-up mode based on route
    this.isSignUpMode = this.router.url.includes('/signup');
  }

  getTitleText(): string {
    return this.isSignUpMode ? 'Join STRIDE & SERVE!' : 'STRIDE & SERVE';
  }

  getDescriptionText(): string {
    return this.isSignUpMode 
      ? 'Create your account with passwordless authentication.' 
      : 'Sign in with passwordless authentication. We\'ll send a magic link to your email.';
  }

  getButtonText(): string {
    return this.isSignUpMode ? 'Send Sign-up Link' : 'Send Sign-In Link';
  }

  private checkSignInLink() {
    try {
      this.isSignInLinkValid = this.firebaseAuth.isSignInLink();
      if (this.isSignInLinkValid) {
        this.completeSignIn();
      }
    } catch (error) {
      console.warn('Error checking sign-in link:', error);
      this.isSignInLinkValid = false;
    }
  }

  async sendSignInLink() {
    if (!this.email) {
      this.errorHandlerService.handleValidationError('Email', 'Please enter your email address');
      return;
    }

    // Validate sign-up fields if in sign-up mode
    if (this.isSignUpMode) {
      if (!this.name || !this.surname || !this.mobile) {
        this.errorHandlerService.handleValidationError('Registration', 'Please fill in all required fields');
        return;
      }
    }

    this.loading = true;

    try {
      // Store additional user data for sign-up
      if (this.isSignUpMode) {
        // Store user data in localStorage for sign-up flow
        localStorage.setItem('signupData', JSON.stringify({
          name: this.name,
          surname: this.surname,
          mobile: this.mobile,
          email: this.email
        }));
        
        // Also update Firebase user profile if user exists (for returning users)
        try {
          const currentUser = this.firebaseAuth.getCurrentUser();
          if (currentUser) {
            await this.firebaseAuth.updateUserProfile({
              displayName: `${this.name} ${this.surname}`
            });
          }
        } catch (error) {
          console.warn('Could not update Firebase profile:', error);
        }
      }

      await this.firebaseAuth.sendSignInLink(this.email);
      this.emailSent = true;
      this.errorHandlerService.handleSuccess(
        this.isSignUpMode ? 'Sign-up link sent to your email' : 'Sign-in link sent to your email'
      );
    } catch (error: any) {
      console.error('Error sending link:', error);
      this.errorHandlerService.handleApiError(error, 'Sign-in Link');
    } finally {
      this.loading = false;
    }
  }

  async completeSignIn() {
    this.processingLink = true;

    try {
      const user = await this.firebaseAuth.completeSignInWithEmailLink();

      if (user) {
        this.errorHandlerService.handleSuccess('Successfully signed in!');

        // Wait for user profile to be loaded
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check user profile and route accordingly
        await this.navigateByRole();
      }
    } catch (error: any) {
      console.error('Error completing sign-in:', error);
      this.errorHandlerService.handleApiError(error, 'Sign-in Completion');

      // Navigate back to sign-in page
      this.router.navigate(['/auth']);
    } finally {
      this.processingLink = false;
    }
  }

  async navigateByRole() {
    // Wait a bit more for the user profile to be loaded
    await new Promise(resolve => setTimeout(resolve, 3000));

    const profile = this.firebaseAuth.getCurrentUserProfile();
    if (!profile) {
      this.router.navigate(['/choose-role']);
      return;
    }

    // If user has multiple roles, go to choose-role page
    if (profile.roles && profile.roles.length > 1) {
      this.router.navigate(['/choose-role']);
    } else if (profile.roles && profile.roles.length === 1) {
      // If user has only one role, go directly to appropriate dashboard
      const role = profile.roles[0];

      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else if (role === 'player') {
        this.router.navigate(['/player']);
      } else {
        this.router.navigate(['/choose-role']);
      }
    } else {
      // No roles assigned, go to choose-role
      this.router.navigate(['/choose-role']);
    }
  }

  resetForm() {
    this.email = '';
    this.name = '';
    this.surname = '';
    this.mobile = '';
    this.emailSent = false;
  }

  isSignInLink(): boolean {
    return this.firebaseAuth.isSignInLink();
  }
}
