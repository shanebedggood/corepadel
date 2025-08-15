import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { UserService } from '../../services/user.service';
import { ClubService, Club } from '../../services/club.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-admin-club-association',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    MessageModule
  ],
  template: `
    <div class="card">
      <h2>Club Association</h2>
      <p>Associate your admin account with a club to create tournaments.</p>
      
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
      
      @if (!isAssociated) {
        <form [formGroup]="associationForm" (ngSubmit)="associateWithClub()">
        <div class="field">
          <label for="club">Select Club</label>
          <p-select 
            id="club" 
            formControlName="clubId" 
            [options]="availableClubs" 
            optionLabel="name" 
            optionValue="club_id"
            placeholder="Select a club">
          </p-select>
        </div>
        
        <div class="field">
          <label for="role">Role</label>
          <p-select 
            id="role" 
            formControlName="role" 
            [options]="roles" 
            placeholder="Select your role">
          </p-select>
        </div>
        
        <p-button 
          type="submit" 
          label="Associate with Club" 
          [loading]="saving"
          [disabled]="!associationForm.valid">
        </p-button>
        </form>
      }
      
      @if (isAssociated && currentClub) {
        <div class="current-association">
        <h3>Current Association</h3>
        <p><strong>Club:</strong> {{ currentClub.name }}</p>
        <p><strong>Role:</strong> {{ currentRole }}</p>
        <p-button 
          label="Remove Association" 
          severity="danger" 
          (onClick)="removeAssociation()"
          [loading]="removing">
        </p-button>
        </div>
      }
    </div>
  `,
  styles: [`
    .card {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .field {
      margin-bottom: 1rem;
    }
    
    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .current-association {
      margin-top: 2rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    
    .p-message {
      margin-bottom: 1rem;
    }
  `]
})
export class AdminClubAssociationComponent implements OnInit {
  associationForm: FormGroup;
  availableClubs: Club[] = [];
  roles = [
    { label: 'Owner', value: 'owner' },
    { label: 'Admin', value: 'admin' },
    { label: 'Member', value: 'member' }
  ];
  
  saving = false;
  removing = false;
  isAssociated = false;
  currentClub: Club | null = null;
  currentRole = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: FirebaseAuthService,
    private userService: UserService,
    private clubService: ClubService,
    private messageService: MessageService
  ) {
    this.associationForm = this.fb.group({
      clubId: ['', Validators.required],
      role: ['owner', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAvailableClubs();
    this.checkCurrentAssociation();
  }

  private loadAvailableClubs(): void {
    this.clubService.getAllClubs().subscribe({
      next: (clubs) => {
        this.availableClubs = clubs;
      },
      error: (error) => {
        console.error('Error loading clubs:', error);
        // Fallback to hardcoded club if API fails
        this.availableClubs = [
          {
            club_id: '5am-club-id', // This should be the actual UUID from the database
            name: '5am Padel Club',
            website: 'https://5ampadel.co.za'
          }
        ];
      }
    });
  }

  private checkCurrentAssociation(): void {
    // For now, set default values since club association is not implemented in Firebase
    this.isAssociated = false;
    this.currentClub = null;
    this.currentRole = '';
  }

  associateWithClub(): void {
    if (this.associationForm.valid) {
      this.saving = true;
      this.errorMessage = '';
      this.successMessage = '';

      // For now, show a message that club association is not yet implemented
      this.saving = false;
      this.errorMessage = 'Club association not yet implemented with Firebase Auth';
      this.messageService.add({
        severity: 'warn',
        summary: 'Not Implemented',
        detail: 'Club association not yet implemented with Firebase Auth'
      });
    }
  }

  removeAssociation(): void {
    if (this.currentClub) {
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
  }
} 