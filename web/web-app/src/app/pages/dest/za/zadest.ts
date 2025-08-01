import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LocalImageService, ResponsiveImageUrls } from '../../../services/local-image.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-za-dest',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Section -->
      <section class="relative h-screen flex items-center justify-center overflow-hidden">
        <!-- Background Image -->
        <div class="absolute inset-0 z-0">
          <picture>
            <!-- WebP format -->
            <source
              [srcset]="imageUrls?.webp?.small + ' 480w, ' + imageUrls?.webp?.medium + ' 768w, ' + imageUrls?.webp?.large + ' 1200w'"
              type="image/webp"
              media="(min-width: 480px)"
            />
            
            <!-- Fallback JPEG format -->
            <source
              [srcset]="imageUrls?.jpg?.small + ' 480w, ' + imageUrls?.jpg?.medium + ' 768w, ' + imageUrls?.jpg?.large + ' 1200w'"
              type="image/jpeg"
              media="(min-width: 480px)"
            />
            
            <!-- Default image -->
            <img
              [src]="imageUrls?.webp?.medium || imageUrls?.jpg?.medium"
              alt="South Africa Padel"
              class="w-full h-full object-cover"
              loading="eager"
            />
          </picture>
          
          <!-- Overlay -->
          <div class="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>

        <!-- Content -->
        <div class="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Padel in South Africa
          </h1>
          <p class="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Discover the fastest growing sport in South Africa
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              (click)="navigateToTournaments()"
              class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              Find Tournaments
            </button>
            <button 
              (click)="navigateToClubs()"
              class="px-8 py-3 bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-semibold rounded-lg transition-colors">
              Find Clubs
            </button>
          </div>
        </div>
      </section>

      <!-- Content Sections -->
      <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Padel in South Africa?
            </h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of tennis and squash in a social, accessible format
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-blue-600 text-2xl">🌞</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Perfect Weather</h3>
              <p class="text-gray-600">South Africa's climate is ideal for outdoor padel year-round</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-green-600 text-2xl">👥</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Growing Community</h3>
              <p class="text-gray-600">Join a rapidly expanding community of padel enthusiasts</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-purple-600 text-2xl">🏆</span>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Tournament Scene</h3>
              <p class="text-gray-600">Regular tournaments and leagues across the country</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: []
})
export class ZaDestComponent implements OnInit, OnDestroy {
  imageUrls: ResponsiveImageUrls | null = null;
  private subscription: Subscription | null = null;

  constructor(
    private localImageService: LocalImageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadZaImage();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadZaImage(): void {
    this.subscription = this.localImageService.getResponsiveImageUrls('za').subscribe({
      next: (urls) => {
        this.imageUrls = urls;
      },
      error: (error) => {
        console.error('Error loading za image:', error);
      }
    });
  }

  navigateToTournaments(): void {
    this.router.navigate(['/tournaments']);
  }

  navigateToClubs(): void {
    this.router.navigate(['/clubs']);
  }
}
