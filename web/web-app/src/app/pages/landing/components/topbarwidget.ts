import { Component } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';

@Component({
    selector: 'topbar-widget',
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule],
    templateUrl: './topbarwidget.component.html',
    styles: []
})
export class TopbarWidget {
    constructor(
        public router: Router,
        private authService: FirebaseAuthService
    ) { }

    directLogin(): void {
        // For Firebase Auth, redirect to auth page
        this.router.navigate(['/auth']);
    }

    directSignup(): void {
        // For Firebase Auth, redirect to signup page
        this.router.navigate(['/auth/signup']);
    }
}
