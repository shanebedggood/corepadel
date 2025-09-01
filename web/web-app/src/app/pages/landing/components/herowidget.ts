import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { LocalImageService, ResponsiveImageUrls } from '../../../services/local-image.service';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-hero-widget',
    imports: [ButtonModule, RippleModule, CommonModule, RouterModule],
    template: `
    <div id="hero" class="relative min-h-[600px] flex items-center justify-center">
      <!-- Responsive background image -->
      @if (imageUrls) {
        <picture class="absolute inset-0">
          <!-- Small WebP -->
          <source [srcset]="imageUrls.webp.small" media="(max-width: 768px)" type="image/webp" />
          <!-- Medium WebP -->
          <source [srcset]="imageUrls.webp.medium" media="(max-width: 1200px)" type="image/webp" />
          <!-- Large WebP -->
          <source [srcset]="imageUrls.webp.large" type="image/webp" />
          <!-- Fallbacks -->
          <source [srcset]="imageUrls.jpg.small" media="(max-width: 768px)" />
          <source [srcset]="imageUrls.jpg.medium" media="(max-width: 1200px)" />
          <img [src]="imageUrls.jpg.large" alt="Hero background" class="absolute inset-0 w-full h-full object-cover" />
        </picture>
      }
      
      <div class="absolute inset-0 bg-black/50"></div>
      
      <div class="relative z-10 text-center px-4">
        <img src="assets/logo.png" alt="STRIDE & SERVE Logo" class="mb-8 w-32 shrink-0 mx-auto" />
        <h1 class="text-5xl sm:text-6xl md:text-7xl font-bold text-white !text-white uppercase" style="font-family: 'Modern Font', sans-serif;">
          STRIDE & SERVE
        </h1>
        <p class="font-normal text-xl sm:text-2xl md:text-3xl leading-normal md:mt-4 text-gray-200 mt-4">
          Your activity. Organised.
        </p>
        <div class="mt-16 flex flex-col sm:flex-row justify-center gap-4">
          <button 
            pButton 
            pRipple 
            label="Sign In" 
            routerLink="/auth" 
            [rounded]="false" 
            severity="primary" 
            class="p-button-lg 2xl font-bold">
          </button>
          <button 
            pButton 
            pRipple 
            label="Sign Up" 
            routerLink="/auth/signup" 
            [rounded]="false" 
            severity="secondary" 
            class="p-button-lg 2xl font-bold">
          </button>
        </div>
      </div>
    </div>
  `
})
export class HeroWidgetComponent implements OnInit, OnDestroy {
    imageUrls: ResponsiveImageUrls | null = null;
    private subscription: Subscription = new Subscription();

    constructor(
        public router: Router,
        private localImageService: LocalImageService
    ) { }

    ngOnInit() {
        this.loadHeroImages();
    }

    ngOnDestroy() {
        // Clean up subscription to prevent memory leaks
        this.subscription.unsubscribe();
    }

    private loadHeroImages() {
        this.subscription = this.localImageService.getResponsiveImageUrls('hero').subscribe({
            next: (urls) => {
                this.imageUrls = urls;
            },
            error: (error) => {
                console.error('Error loading hero images:', error);
                // No fallback - images must be available in local storage
                this.imageUrls = null;
            }
        });
    }
}
