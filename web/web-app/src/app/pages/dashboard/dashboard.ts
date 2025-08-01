import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpcomingEventsWidget } from './components/upcomingeventswidget';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, UpcomingEventsWidget],
  template: `
    <div class="card">
      <!-- Dashboard Content -->
      <div class="grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        <div class="col-span-12">
          <app-upcoming-events-widget />
        </div>
      </div>
    </div>
  `
})
export class Dashboard {
}
