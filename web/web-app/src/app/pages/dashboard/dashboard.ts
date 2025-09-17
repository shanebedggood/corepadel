import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpcomingTournamentsWidget } from './components/upcomingtournamentswidget';
import { RunBookingsWidget } from './components/runbookingswidget';
import { CourtBookingsWidget } from './components/courtbookingswidget';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, DividerModule, RunBookingsWidget, CourtBookingsWidget, UpcomingTournamentsWidget],
  template: `
    <div class="grid grid-cols-12 gap-8">
      <app-upcoming-tournaments-widget class="contents" />
      <div class="col-span-12 xl:col-span-6">
        <app-court-bookings-widget />
      </div>
      <div class="col-span-12 xl:col-span-6">
        <app-run-bookings-widget />
      </div>
    </div>
  `
})
export class Dashboard {
}
