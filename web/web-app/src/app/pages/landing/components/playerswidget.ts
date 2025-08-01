import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LocalImageService } from '../../../services/local-image.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-players-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Join the Padel Community
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with players, join tournaments, and improve your game with our community
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 items-center">
          <!-- Image -->
          <div class="relative">
            <div *ngIf="imageUrl" class="rounded-lg overflow-hidden shadow-lg">
              <img 
                [src]="imageUrl" 
                alt="Padel Players" 
                class="w-full h-64 md:h-96 object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <!-- Content -->
          <div class="space-y-6">
            <div class="space-y-4">
              <h3 class="text-2xl font-semibold text-gray-900">
                Find Your Perfect Match
              </h3>
              <p class="text-gray-600">
                Discover players at your skill level, join clubs, and participate in tournaments 
                designed to challenge and improve your game.
              </p>
            </div>

            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 font-semibold">1</span>
                </div>
                <span class="text-gray-700">Create your player profile</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 font-semibold">2</span>
                </div>
                <span class="text-gray-700">Join tournaments and leagues</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 font-semibold">3</span>
                </div>
                <span class="text-gray-700">Track your progress and rankings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class PlayersWidgetComponent implements OnInit, OnDestroy {
  imageUrl: string | null = null;
  private subscription: Subscription | null = null;

  constructor(
    private localImageService: LocalImageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlayersImage();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadPlayersImage(): void {
    this.subscription = this.localImageService.getResponsiveImageUrl('players', 'webp', 'small').subscribe({
      next: (url) => {
        this.imageUrl = url;
      },
      error: (error) => {
        console.error('Error loading players image:', error);
      }
    });
  }

  navigateToTournaments(): void {
    this.router.navigate(['/tournaments']);
  }
}
