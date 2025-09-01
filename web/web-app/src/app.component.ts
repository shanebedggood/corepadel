import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FirebaseAuthService } from './app/services/firebase-auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
    constructor(private authService: FirebaseAuthService) {}

    async ngOnInit() {
        // Attempt to recover authentication state on app startup
        // This helps with deployment login issues
        try {
            await this.authService.recoverAuthentication();
        } catch (error) {
            console.warn('Authentication recovery failed on startup:', error);
        }
    }
}
