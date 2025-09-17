import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LocalImageService } from '../../../services/local-image.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-clubs-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <div class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            For Clubs & Organizers
          </div>
          <p class="text-xl text-gray-600">
            Streamline your tournament management and enhance member engagement
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 items-center">
          <!-- Content -->
          <div class="space-y-6">
            <div class="space-y-4">
              <div class="text-2xl font-semibold text-gray-900">
                Manage Your Club Efficiently
              </div>
              <p class="text-gray-600">
                Create and manage tournaments, track player registrations, and provide 
                seamless experiences for your members.
              </p>
            </div>

            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-600 font-semibold">✓</span>
                </div>
                <span class="text-gray-700">Easy tournament creation and management</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-600 font-semibold">✓</span>
                </div>
                <span class="text-gray-700">Automated player registration and payments</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-600 font-semibold">✓</span>
                </div>
                <span class="text-gray-700">Real-time match scheduling and results</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-600 font-semibold">✓</span>
                </div>
                <span class="text-gray-700">Member communication and notifications</span>
              </div>
            </div>
          </div>

          <!-- Image -->
          <div class="relative">
            @if (imageUrl) {
              <div class="rounded-lg overflow-hidden shadow-lg">
                <img 
                  [src]="imageUrl" 
                  alt="Padel Equipment" 
                  class="w-full h-64 md:h-96 object-cover"
                  loading="lazy"
                />
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class ClubsWidgetComponent implements OnInit, OnDestroy {
  imageUrl: string | null = null;
  private subscription: Subscription | null = null;

  constructor(
    private localImageService: LocalImageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClubsImage();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadClubsImage(): void {
    this.subscription = this.localImageService.getResponsiveImageUrl('rackets', 'webp', 'small').subscribe({
      next: (url) => {
        this.imageUrl = url;
      },
      error: (error) => {
        console.error('Error loading clubs image:', error);
      }
    });
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
