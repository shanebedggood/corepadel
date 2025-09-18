import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { RunBooking, RunBookingService, RunSlot } from '../../../services/run-booking.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-run-bookings-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, TableModule, RouterModule],
  template: `
    <p-card class="run-card">
      <ng-template pTemplate="header">
        <div class="run-header">
          <div class="run-title">
            <i class="pi pi-bolt mr-2"></i>
            <span class="font-bold text-lg text-gray-800">5AM Run bookings</span>
          </div>
        </div>
      </ng-template>

      @if (loading()) {
        <div class="p-4"><p>Loading…</p></div>
      } @else if (bookings().length === 0) {
        <div class="p-4 text-gray-600">No upcoming runs booked.</div>
      } @else {
        <div class="run-content">
          <p-table [value]="getUserBookingsWithCounts()" [paginator]="false" [rows]="10" size="small">
            <ng-template pTemplate="header">
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Runners</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-booking>
              <tr>
                <td>
                  <div class="font-medium">{{ booking.booking_date | date:'EEE, MMM d' }}</div>
                </td>
                <td>
                  <div class="text-600">{{ booking.booking_time }}</div>
                </td>
                <td>
                  <div class="text-600">{{ booking.runnerCount }}</div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }

      <ng-template pTemplate="footer">
        <div class="run-footer">
          <p-button label="Go to runs" [routerLink]="['/player/run-booking']"></p-button>
        </div>
      </ng-template>
    </p-card>
  `,
  styles: [`
    .run-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: none;
      overflow: hidden;
    }
    .run-header {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #1f2937;
    }
    .run-title { display: flex; align-items: center; }
    .run-content { padding: 1.5rem; background: white; }
    .run-footer {
      padding: 1rem 1.5rem;
      background: white;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      font-size: 1rem;
    }
    
  `],
  styleUrls: ['../../../shared/styles/button.styles.scss']
})
export class RunBookingsWidget {
  private runService = inject(RunBookingService);
  private auth = inject(FirebaseAuthService);

  loading = signal<boolean>(true);
  bookings = signal<RunBooking[]>([]);
  slots = signal<RunSlot[]>([]);

  constructor() {
    this.auth.userProfile$.pipe(take(1)).subscribe(profile => {
      if (!profile?.firebaseUid) {
        this.loading.set(false);
        return;
      }
      const now = new Date();
      const start = this.formatDate(now);
      const inThirty = new Date(now);
      inThirty.setDate(now.getDate() + 30);
      const end = this.formatDate(inThirty);
      this.runService.getUserBookings(profile.firebaseUid, start, end).pipe(take(1)).subscribe({
        next: list => {
          // Sort by date ascending
          const sorted = (list || []).sort((a, b) => a.booking_date.localeCompare(b.booking_date));
          this.bookings.set(sorted);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });

      // Also load slots to get runner counts
      this.runService.getBookingsForMonth(
        now.getFullYear(), 
        now.getMonth() + 1, 
        profile.firebaseUid
      ).pipe(take(1)).subscribe({
        next: slots => {
          this.slots.set(slots || []);
        },
        error: () => {}
      });
    });
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  getUserBookingsWithCounts(): any[] {
    return this.bookings().map(booking => {
      // Find the corresponding slot to get runner count
      const slot = this.slots().find(s => s.date === booking.booking_date);
      const runnerCount = slot ? slot.bookings.length : 1;
      
      return {
        ...booking,
        runnerCount: runnerCount
      };
    });
  }

}


