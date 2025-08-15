import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { UserService } from '../../services/user.service';
import { ClubService } from '../../services/club.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-admin-setup',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MessageModule
  ],
  template: `
    <div class="card">
      <h2>Admin Setup</h2>
      <p>Complete the setup for your admin account.</p>
      
      @if (errorMessage) {
        <div class="p-message p-message-error">
          <p-message severity="error" [text]="errorMessage"></p-message>
        </div>
      }
      
      @if (successMessage) {
        <div class="p-message p-message-success">
          <p-message severity="success" [text]="successMessage"></p-message>
        </div>
      }
      
      <div class="setup-section">
        <h3>1. Club Association</h3>
        <p>You need to be associated with a club to create tournaments.</p>
        
        @if (!hasClubAssociation) {
          <div class="setup-action">
            <p><strong>Status:</strong> <span class="text-red-500">Not associated with any club</span></p>
            <p-button 
              label="Associate with 5am Padel Club" 
              (onClick)="associateWithDefaultClub()"
              [loading]="associating"
              severity="primary">
            </p-button>
          </div>
        }
        
        @if (hasClubAssociation) {
          <div class="setup-action">
            <p><strong>Status:</strong> <span class="text-green-500">Associated with {{ currentClubName }}</span></p>
            <p-button 
              label="Remove Association" 
              (onClick)="removeClubAssociation()"
              [loading]="removing"
              severity="danger">
            </p-button>
          </div>
        }
      </div>
      
      <div class="setup-section">
        <h3>2. Next Steps</h3>
        <p>Once you're associated with a club, you can:</p>
        <ul>
          <li>Create tournaments</li>
          <li>Manage tournament participants</li>
          <li>Schedule matches</li>
          <li>Track results</li>
        </ul>
        
        @if (hasClubAssociation) {
          <p-button 
            label="Go to Tournaments" 
            (onClick)="goToTournaments()"
            severity="success">
          </p-button>
        }
      </div>
    </div>
  `,
  styles: [`
    .card {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .setup-section {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    
    .setup-section h3 {
      margin-bottom: 1rem;
      color: #374151;
    }
    
    .setup-action {
      margin-top: 1rem;
    }
    
    .p-message {
      margin-bottom: 1rem;
    }
    
    ul {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }
    
    li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class AdminSetupComponent implements OnInit {
  hasClubAssociation = false;
  currentClubName = '';
  associating = false;
  removing = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: FirebaseAuthService,
    private userService: UserService,
    private clubService: ClubService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkClubAssociation();
  }

  private checkClubAssociation(): void {
    // For now, set default values since club association is not implemented in Firebase
    this.hasClubAssociation = false;
    this.currentClubName = '';
  }

  associateWithDefaultClub(): void {
    this.associating = true;
    this.errorMessage = '';
    this.successMessage = '';

    // For now, show a message that club association is not yet implemented
    this.associating = false;
    this.errorMessage = 'Club association not yet implemented with Firebase Auth';
    this.messageService.add({
      severity: 'warn',
      summary: 'Not Implemented',
      detail: 'Club association not yet implemented with Firebase Auth'
    });
  }

  removeClubAssociation(): void {
    this.removing = true;
    this.errorMessage = '';
    this.successMessage = '';

    // For now, show a message that club association is not yet implemented
    this.removing = false;
    this.errorMessage = 'Club association not yet implemented with Firebase Auth';
    this.messageService.add({
      severity: 'warn',
      summary: 'Not Implemented',
      detail: 'Club association not yet implemented with Firebase Auth'
    });
  }

  goToTournaments(): void {
    this.router.navigate(['/admin/tournaments']);
  }
} 