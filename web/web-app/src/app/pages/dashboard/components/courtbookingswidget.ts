import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { CourtBooking, CourtScheduleService } from '../../../services/court-schedule.service';
import { VenueService } from '../../../services/venue.service';
import type { Venue } from '../../../services/quarkus-venue.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-court-bookings-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, TableModule, RouterModule],
  template: `
    <p-card class="court-card">
      <ng-template pTemplate="header">
        <div class="court-header">
          <div class="court-title">
            <i class="pi pi-calendar mr-2"></i>
            <span class="font-bold text-lg text-gray-800">My Padel Bookings</span>
          </div>
        </div>
      </ng-template>

      @if (loading()) {
        <div class="p-4"><p>Loading…</p></div>
      } @else if (bookings().length === 0) {
        <div class="p-4 text-gray-600">No upcoming court bookings.</div>
      } @else {
        <div class="court-content">
          <p-table [value]="bookings()" [paginator]="false" [rows]="10" size="small">
            <ng-template pTemplate="header">
              <tr>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Court</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-booking>
              <tr>
                <td>
                  <div class="font-medium">{{ getDisplayDate(booking) }} • {{ formatTimeRange(booking.timeSlot, booking.gameDuration) }}</div>
                </td>
                <td>
                  <div class="text-600">{{ getVenueName(booking.venueId) }}</div>
                </td>
                <td>
                  <div class="text-600">Court {{ booking.courtNumber }}</div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }

      <ng-template pTemplate="footer">
        <div class="court-footer">
          <p-button label="Manage bookings" [routerLink]="['/player/court-booking']"></p-button>
        </div>
      </ng-template>
    </p-card>
  `,
  styles: [`
    .court-card { border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: none; overflow: hidden; }
    .court-header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 1rem; display:flex; justify-content:space-between; align-items:center; color:#1f2937; }
    .court-title { display:flex; align-items:center; }
    .court-content { padding: 1.5rem; background: white; }
    .court-footer { padding: 1rem 1.5rem; background: white; border-top: 1px solid #e2e8f0; display:flex; justify-content:flex-end; font-size: 1rem; }
  `],
  styleUrls: ['../../../shared/styles/button.styles.scss']
})
export class CourtBookingsWidget {
  private courtService = inject(CourtScheduleService);
  private auth = inject(FirebaseAuthService);
  private venueService = inject(VenueService);

  @Input() showTitle = true;

  loading = signal<boolean>(true);
  bookings = signal<CourtBooking[]>([]);
  private venueNameById = new Map<string, string>();

  constructor() {
    // Preload venues for name lookup
    this.venueService.getVenues().pipe(take(1)).subscribe({
      next: (venues: Venue[]) => (venues || []).forEach(v => { if (v?.id) this.venueNameById.set(v.id, v.name); }),
      error: () => {}
    });

    this.auth.userProfile$.pipe(take(1)).subscribe(profile => {
      if (!profile?.firebaseUid) {
        this.loading.set(false);
        return;
      }
      const now = new Date();
      const start = this.formatDate(now);
      const inSixty = new Date(now);
      inSixty.setDate(now.getDate() + 60);
      const end = this.formatDate(inSixty);
      this.courtService.getUserBookings(profile.firebaseUid, start, end).pipe(take(1)).subscribe({
        next: list => {
          const upcoming = (list || []).filter(b => (b as any).status === 'confirmed');
          upcoming.sort((a, b) => this.getStartTime(a) - this.getStartTime(b));
          this.bookings.set(upcoming);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    });
  }

  private getStartTime(b: CourtBooking): number {
    const dateStr: string = (b as any).bookingDate || (b as any).date || '';
    if (!dateStr || !b.timeSlot) return Number.MAX_SAFE_INTEGER;
    const [y, m, d] = dateStr.split('-').map((x: string) => parseInt(x, 10));
    const [hh, mm] = b.timeSlot.split(':').map((x: string) => parseInt(x, 10));
    const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
    return dt.getTime();
  }

  getDisplayDate(b: CourtBooking): string {
    const raw = (b as any).bookingDate || (b as any).date || '';
    const [y, m, d] = raw.split('-').map((x: string) => parseInt(x, 10));
    if (!y || !m || !d) return '';
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  formatTimeRange(timeSlot: string, durationMinutes: number): string {
    const [hours, minutes] = timeSlot.split(':');
    const startHour = parseInt(hours, 10);
    const startMinute = parseInt(minutes, 10);
    const startTotal = startHour * 60 + startMinute;
    const endTotal = startTotal + durationMinutes;
    const endHour = Math.floor(endTotal / 60) % 24;
    const endMinute = endTotal % 60;
    const fmt = (h: number, m: number) => {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
    return `${fmt(startHour, startMinute)} - ${fmt(endHour, endMinute)}`;
  }

  getVenueName(venueId: string | null | undefined): string {
    if (!venueId) return '-';
    return this.venueNameById.get(venueId) || '-';
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}


