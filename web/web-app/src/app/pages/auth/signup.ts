import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FirebaseAuthService } from '../../services/firebase-auth.service';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToastModule],
    templateUrl: './signup.component.html',
    providers: [MessageService]
})
export class SignupComponent implements OnInit {
    email: string = '';
    name: string = '';
    surname: string = '';
    mobile: string = '';
    isLoading: boolean = false;
    backgroundImageUrl: string = 'assets/images/large/hero.jpg';

    constructor(
        private router: Router,
        private authService: FirebaseAuthService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        // Check if user is already authenticated
        this.authService.isAuthenticated().subscribe(isAuthenticated => {
            if (isAuthenticated) {
                this.router.navigate(['/choose-role']);
            }
        });
    }

    onSignUp(): void {
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;
        
        // Send passwordless sign-in link to email
        this.authService.sendSignInLinkToEmail(this.email).subscribe({
            next: () => {
                this.isLoading = false;
                // Save email and user info for the check-email page
                localStorage.setItem('signupEmail', this.email);
                localStorage.setItem('signupName', this.name);
                localStorage.setItem('signupSurname', this.surname);
                localStorage.setItem('signupMobile', this.mobile);
                this.router.navigate(['/auth/check-email']);
            },
            error: (error) => {
                this.isLoading = false;
                console.error('Failed to send sign-in link:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Failed to Send Link',
                    detail: 'Unable to send sign-in link. Please try again.'
                });
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/']);
    }

    private validateForm(): boolean {
        if (!this.email || !this.isValidEmail(this.email)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Invalid Email',
                detail: 'Please enter a valid email address.'
            });
            return false;
        }

        if (!this.name || !this.surname) {
            this.messageService.add({
                severity: 'error',
                summary: 'Missing Information',
                detail: 'Please enter your first and last name.'
            });
            return false;
        }

        return true;
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
} 