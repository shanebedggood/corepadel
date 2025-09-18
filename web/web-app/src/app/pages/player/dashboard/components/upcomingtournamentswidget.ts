import { Component, Input, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { CarouselModule } from 'primeng/carousel';
import { RouterModule } from '@angular/router';
import { Tournament, TournamentService } from '../../../../services/tournament.service';

@Component({
  selector: 'app-upcoming-tournaments-widget',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TagModule, CarouselModule, RouterModule],
  templateUrl: './upcomingtournamentswidget.html',
  styleUrls: ['../../../../shared/styles/button.styles.scss'],
  styles: [`
    .card {
      background-color: var(--surface-card);
      border-radius: var(--content-border-radius);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .tournament-item {
      padding: 0.5rem;
    }
    
    .tournament-card {
      border-radius: 12px;
      box-shadow: none;
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
      overflow: hidden;
    }
    
    .tournament-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .tournament-header {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      padding: 1rem;
      color: #1f2937;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .tournament-title {
      display: flex;
      align-items: center;
    }
    
    .tournament-badge {
      margin-left: 1rem;
    }
    
    .category-tag {
      background: rgba(51, 65, 84, 0.8) !important;
      color: white !important;
      border: 1px solid rgba(31, 41, 55, 0.9) !important;
      font-size: 1rem;
    }
    
    .tournament-content {
      padding: 1.5rem;
      background: white;
      font-size: 0.9rem;
    }
    
    .tournament-info-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
      color: #374151;
      font-size: 1rem;
    }
    
    .tournament-info-item:last-child {
      margin-bottom: 0;
    }
    
    .tournament-footer {
      padding: 0.5rem 1rem;
      background: white;
      border-top: 1px solid #e2e8f0;
      font-size: 1rem;
    }
    
    .tournament-footer ::ng-deep .p-button {
      font-size: 1rem !important;
    }
    
    .custom-carousel ::ng-deep .p-carousel-content {
      padding: 0;
    }
    
    .custom-carousel ::ng-deep .p-carousel-indicators {
      margin-top: 1.5rem;
    }
    
    .custom-carousel ::ng-deep .p-carousel-indicator button {
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      width: 12px;
      height: 12px;
    }
    
    .custom-carousel ::ng-deep .p-carousel-indicator.p-highlight button {
      background-color: var(--primary-color);
    }
    
    .custom-carousel ::ng-deep .p-carousel-prev,
    .custom-carousel ::ng-deep .p-carousel-next {
      background-color: var(--surface-card);
      border: 1px solid var(--surface-border);
      color: var(--text-color);
    }
    
    .custom-carousel ::ng-deep .p-carousel-prev:hover,
    .custom-carousel ::ng-deep .p-carousel-next:hover {
      background-color: var(--surface-hover);
    }
  `]
})
export class UpcomingTournamentsWidget {
  private tournamentService = inject(TournamentService);

  @Input() showTitle = true;

  loading = signal<boolean>(true);
  tournaments = signal<Tournament[]>([]);

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  filtered = computed(() => {
    const now = new Date().getTime();
    return this.tournaments().filter(t => {
      const start = t.startDate ? new Date(t.startDate).getTime() : 0;
      return start >= now && (t.accessType === 'open' || !t.accessType);
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  });

  constructor() {
    this.tournamentService.getTournaments().subscribe({
      next: ts => {
        this.tournaments.set(ts || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}


