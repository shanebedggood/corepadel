import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalImageService } from '../../../services/local-image.service';
import { Subscription, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-sponsors-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Sponsors
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Proud to partner with leading brands in the padel community
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Wattshot Sponsor -->
          <div class="text-center">
            <div class="bg-white rounded-lg p-6 shadow-md">
              @if (wattshotUrl$ | async; as wattshotUrl) {
                <div class="mb-4">
                  <img 
                    [src]="wattshotUrl" 
                    alt="Wattshot Sponsor" 
                    class="w-32 h-32 mx-auto object-contain"
                    loading="lazy"
                  />
                </div>
              }
              <h3 class="text-xl font-semibold text-gray-900 mb-2">The world's best shot.</h3>
            </div>
          </div>

          <!-- 5am Club Sponsor -->
          <div class="text-center">
            <div class="bg-white rounded-lg p-6 shadow-md">
              @if (fiveAmClubUrl$ | async; as fiveAmClubUrl) {
                <div class="mb-4">
                  <img 
                    [src]="fiveAmClubUrl" 
                    alt="5am Club Sponsor" 
                    class="w-32 h-32 mx-auto object-contain"
                    loading="lazy"
                  />
                </div>
              }
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Club Partner</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class SponsorsWidgetComponent implements OnInit, OnDestroy {
  wattshotUrl$: Observable<string> = of('');
  fiveAmClubUrl$: Observable<string> = of('');
  private subscription: Subscription | null = null;

  constructor(private localImageService: LocalImageService) {}

  ngOnInit(): void {
    this.loadSponsorImages();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadSponsorImages(): void {
    // Load Wattshot image - try webp first, then png
    this.wattshotUrl$ = this.localImageService.getImageUrl('wattshot.webp').pipe(
      catchError(() => this.localImageService.getImageUrl('wattshot.png')),
      catchError(error => {
        console.error('Error loading Wattshot image:', error);
        return of('');
      })
    );

    // Load 5am Club image - try webp first, then png
    this.fiveAmClubUrl$ = this.localImageService.getImageUrl('5am club.webp').pipe(
      catchError(() => this.localImageService.getImageUrl('5am club.png')),
      catchError(error => {
        console.error('Error loading 5am Club image:', error);
        return of('');
      })
    );
  }
}
