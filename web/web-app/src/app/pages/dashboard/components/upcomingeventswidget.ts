import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CarouselModule } from 'primeng/carousel';
import { PaginatorModule } from 'primeng/paginator';

interface Event {
  id: number;
  name: string;
  venue: string;
  date: string;
  time: string;
  image?: string;
  gender: 'Male' | 'Female' | 'Open';
}

@Component({
  standalone: true,
  selector: 'app-upcoming-events-widget',
  imports: [CommonModule, ButtonModule, MenuModule, CarouselModule, PaginatorModule],
  templateUrl: './upcomingeventswidget.component.html',
  styles: []
})
export class UpcomingEventsWidget {
  items = [
    { label: 'Add Event', icon: 'pi pi-fw pi-plus' },
    { label: 'View All', icon: 'pi pi-fw pi-calendar' },
    { label: 'Settings', icon: 'pi pi-fw pi-cog' }
  ];

  images = [
    'assets/aura.webp',
    'assets/atlantic_padel_parklands.webp',
    'assets/padel365.webp'
  ];

  events: Event[] = [
    {
      id: 1,
      name: 'Padel Championship Finals',
      venue: 'Padel 365 Richmond',
      date: 'Dec 15, 2024',
      time: '2:00 PM',
      image: 'assets/padel365.webp',
      gender: 'Male'
    },
    {
      id: 2,
      name: 'Beginner Training Session',
      venue: 'Padel 365 Richmond',
      date: 'Dec 18, 2024',
      time: '6:30 PM',
      image: 'assets/padel365.webp',
      gender: 'Female'
    },
    {
      id: 3,
      name: 'Pro-Am Tournament',
      venue: 'Aura Padel Club',
      date: 'Dec 22, 2024',
      time: '10:00 AM',
      image: 'assets/aura.webp',
      gender: 'Open'
    },
    {
      id: 4,
      name: 'Youth Development Camp',
      venue: 'Atlantic Padel Parklands',
      date: 'Dec 25, 2024',
      time: '9:00 AM',
      image: 'assets/atlantic_padel_parklands.webp',
      gender: 'Male'
    },
    {
      id: 5,
      name: 'Corporate Team Building',
      venue: 'Padel 365 Richmond',
      date: 'Dec 28, 2024',
      time: '4:00 PM',
      image: 'assets/padel365.webp',
      gender: 'Open'
    },
    {
      id: 6,
      name: 'Advanced Skills Workshop',
      venue: 'Aura Padel Club',
      date: 'Dec 30, 2024',
      time: '3:00 PM',
      image: 'assets/aura.webp',
      gender: 'Female'
    },
    {
      id: 7,
      name: 'New Year Tournament',
      venue: 'Atlantic Padel Parklands',
      date: 'Jan 1, 2025',
      time: '11:00 AM',
      image: 'assets/atlantic_padel_parklands.webp',
      gender: 'Open'
    }
  ];

  // Track the current carousel page
  currentPage = 0;
  numVisible = 3;
  numScroll = 3;

  constructor() {
    this.updateResponsiveSettings();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateResponsiveSettings();
  }

  updateResponsiveSettings() {
    const width = window.innerWidth;
    if (width < 576) {
      // mobile (below sm breakpoint)
      this.numVisible = 1;
      this.numScroll = 1;
    } else if (width < 992) {
      // tablet (below lg breakpoint)
      this.numVisible = 2;
      this.numScroll = 2;
    } else {
      // desktop
      this.numVisible = 3;
      this.numScroll = 3;
    }
  }

  onCarouselPage(event: { page?: number }) {
    this.currentPage = event.page ?? 0;
  }

  isEventVisible(index: number): boolean {
    return (
      index >= this.currentPage * this.numVisible &&
      index < (this.currentPage + 1) * this.numVisible
    );
  }
}
