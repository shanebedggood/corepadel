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
      
      <div *ngIf="errorMessage" class="p-message p-message-error">
        <p-message severity="error" [text]="errorMessage"></p-message>
      </div>
      
      <div *ngIf="successMessage" class="p-message p-message-success">
        <p-message severity="success" [text]="successMessage"></p-message>
      </div>
      
      <div class="setup-section">
        <h3>1. Club Association</h3>
        <p>You need to be associated with a club to create tournaments.</p>
        
        <div *ngIf="!hasClubAssociation" class="setup-action">
          <p><strong>Status:</strong> <span class="text-red-500">Not associated with any club</span></p>
          <p-button 
            label="Associate with 5am Padel Club" 
            (onClick)="associateWithDefaultClub()"
            [loading]="associating"
            severity="primary">
          </p-button>
        </div>
        
        <div *ngIf="hasClubAssociation" class="setup-action">
          <p><strong>Status:</strong> <span class="text-green-500">Associated with {{ currentClubName }}</span></p>
          <p-button 
            label="Remove Association" 
            (onClick)="removeClubAssociation()"
            [loading]="removing"
            severity="danger">
          </p-button>
        </div>
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
        
        <p-button 
          *ngIf="hasClubAssociation"
          label="Go to Tournaments" 
          (onClick)="goToTournaments()"
          severity="success">
        </p-button>
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
    this.authService.getCurrentUserClub().subscribe({
      next: (club) => {
        if (club) {
          this.hasClubAssociation = true;
          this.currentClubName = club.name;
        } else {
          this.hasClubAssociation = false;
          this.currentClubName = '';
        }
      },
      error: (error) => {
        console.error('Error checking club association:', error);
        this.hasClubAssociation = false;
      }
    });
  }

  associateWithDefaultClub(): void {
    this.associating = true;
    this.errorMessage = '';
    this.successMessage = '';

    // First, get the club ID for 5am Padel Club
    this.clubService.getAllClubs().subscribe({
      next: (clubs) => {
        const fiveAmClub = clubs.find(club => club.name === '5am Padel Club');
        if (fiveAmClub && fiveAmClub.club_id) {
          this.authService.user$.pipe(take(1)).subscribe({
            next: (user) => {
              if (user) {
                this.userService.addUserToClubByFirebaseUid(user.uid, fiveAmClub.club_id!, 'owner').subscribe({
                  next: (userClub) => {
                    this.associating = false;
                    if (userClub) {
                      this.successMessage = 'Successfully associated with 5am Padel Club!';
                      this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Successfully associated with 5am Padel Club!'
                      });
                      this.checkClubAssociation();
                    } else {
                      this.errorMessage = 'Failed to associate with club';
                    }
                  },
                  error: (error) => {
                    this.associating = false;
                    this.errorMessage = error.message || 'Failed to associate with club';
                  }
                });
              } else {
                this.associating = false;
                this.errorMessage = 'No user found';
              }
            },
            error: (error) => {
              this.associating = false;
              this.errorMessage = 'No user found';
            }
          });
        } else {
          this.associating = false;
          this.errorMessage = '5am Padel Club not found in database';
        }
      },
      error: (error) => {
        this.associating = false;
        this.errorMessage = 'Failed to load clubs';
      }
    });
  }

  removeClubAssociation(): void {
    this.removing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.getCurrentUserClub().subscribe({
      next: (club) => {
        if (club && club.id) {
          this.authService.user$.pipe(take(1)).subscribe({
            next: (user) => {
              if (user) {
                this.userService.removeUserFromClubByFirebaseUid(user.uid, club.id).subscribe({
                  next: (success) => {
                    this.removing = false;
                    if (success) {
                      this.successMessage = 'Successfully removed club association!';
                      this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Successfully removed club association!'
                      });
                      this.checkClubAssociation();
                    } else {
                      this.errorMessage = 'Failed to remove club association';
                    }
                  },
                  error: (error) => {
                    this.removing = false;
                    this.errorMessage = error.message || 'Failed to remove club association';
                  }
                });
              } else {
                this.removing = false;
                this.errorMessage = 'No user found';
              }
            },
            error: (error) => {
              this.removing = false;
              this.errorMessage = 'No user found';
            }
          });
        } else {
          this.removing = false;
          this.errorMessage = 'No club association found';
        }
      },
      error: (error) => {
        this.removing = false;
        this.errorMessage = 'Failed to get current club association';
      }
    });
  }

  goToTournaments(): void {
    this.router.navigate(['/admin/tournaments']);
  }
} 