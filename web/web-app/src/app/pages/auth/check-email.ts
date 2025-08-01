import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FirebaseAuthService } from '../../services/firebase-auth.service';

@Component({
    selector: 'app-check-email',
    standalone: true,
    imports: [CommonModule, ButtonModule, ToastModule],
    templateUrl: './check-email.component.html',
    providers: [MessageService]
})
export class CheckEmailComponent implements OnInit {
    email: string = '';
    backgroundImageUrl: string = 'assets/images/large/hero.jpg';

    constructor(
        private router: Router,
        private messageService: MessageService,
        private authService: FirebaseAuthService
    ) { }

    ngOnInit(): void {
        // Check if this is a sign-in link
        if (this.authService.isSignInWithEmailLink()) {
            this.handleEmailLink();
        } else {
            // Get email from localStorage
            this.email = localStorage.getItem('signupEmail') || '';
            if (!this.email) {
                this.router.navigate(['/auth/email-input']);
            }
        }
    }

    private handleEmailLink(): void {
        const email = localStorage.getItem('emailForSignIn') || '';
        if (!email) {
            this.messageService.add({
                severity: 'error',
                summary: 'Authentication Error',
                detail: 'Email not found. Please try signing in again.'
            });
            this.router.navigate(['/auth/email-input']);
            return;
        }

        this.authService.signInWithEmailLink(email).subscribe({
            next: () => {
                // Clear stored email
                localStorage.removeItem('emailForSignIn');
                localStorage.removeItem('signupEmail');
                
                // Check if this was a signup (has additional user info)
                const signupName = localStorage.getItem('signupName');
                const signupSurname = localStorage.getItem('signupSurname');
                const signupMobile = localStorage.getItem('signupMobile');
                
                if (signupName && signupSurname) {
                    // This was a signup, create user profile
                    // TODO: Create user profile in backend
                    localStorage.removeItem('signupName');
                    localStorage.removeItem('signupSurname');
                    localStorage.removeItem('signupMobile');
                }
                
                this.router.navigate(['/choose-role']);
            },
            error: (error) => {
                console.error('Failed to sign in with email link:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Authentication Failed',
                    detail: 'Failed to authenticate. Please try again.'
                });
                this.router.navigate(['/auth/email-input']);
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/']);
    }

    resendEmail(): void {
        // Redirect back to email input to resend the link
        this.router.navigate(['/auth/email-input']);
    }
} 