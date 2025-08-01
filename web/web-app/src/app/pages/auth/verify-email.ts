import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FirebaseAuthService } from '../../services/firebase-auth.service';

@Component({
    selector: 'app-verify-email',
    standalone: true,
    imports: [CommonModule, ButtonModule, ToastModule],
    templateUrl: './verify-email.component.html',
    providers: [MessageService]
})
export class VerifyEmailComponent implements OnInit {
    backgroundImageUrl: string = 'assets/images/large/hero.jpg';
    isLoading: boolean = true;
    error: string = '';

    constructor(
        private router: Router,
        private authService: FirebaseAuthService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        // Check if user is authenticated
        this.authService.isAuthenticated().subscribe(isAuthenticated => {
            if (isAuthenticated) {
                this.isLoading = false;
                // Redirect after a short delay to show success message
                setTimeout(() => {
                    this.router.navigate(['/choose-role']);
                }, 2000);
            } else {
                this.isLoading = false;
                this.error = 'Email verification failed. Please try again.';
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/']);
    }

    retryVerification(): void {
        this.isLoading = true;
        this.error = '';
        // Since magic links are deprecated, redirect to Google OAuth
        this.router.navigate(['/auth/email-input']);
    }
} 