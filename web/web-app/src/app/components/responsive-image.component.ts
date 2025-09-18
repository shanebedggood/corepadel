import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LocalImageService, ResponsiveImageUrls } from '../services/local-image.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-responsive-image',
  template: `
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
        [alt]="alt"
        [class]="cssClass"
        loading="lazy"
        (error)="onImageError($event)"
      />
    </picture>
  `,
  styles: [`
    img {
      max-width: 100%;
      height: auto;
    }
  `]
})
export class ResponsiveImageComponent implements OnInit, OnDestroy {
  @Input() imageName!: string;
  @Input() alt: string = '';
  @Input() cssClass: string = '';

  imageUrls: ResponsiveImageUrls | null = null;
  private subscription: Subscription | null = null;

  constructor(
    private localImageService: LocalImageService
  ) { }

  ngOnInit(): void {
    if (this.imageName) {
      this.loadImage();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadImage(): void {
    this.subscription = this.localImageService.getResponsiveImageUrls(this.imageName).subscribe({
      next: (urls) => {
        this.imageUrls = urls;
      },
      error: (error) => {
        console.error('Error loading responsive image:', error);
      }
    });
  }

  onImageError(event: any): void {
    console.error('Image failed to load:', event);
    
    if (!this.imageUrls) {
      return;
    }

    const target = event.target as HTMLImageElement;
    const currentSrc = target.src;
    
    // If the failed image is WebP, try to fallback to JPEG
    if (currentSrc.includes('.webp')) {
      const jpgSrc = currentSrc.replace('.webp', '.jpg');
      if (this.imageUrls.jpg) {
        // Find the matching size
        if (currentSrc.includes('/small/')) {
          target.src = this.imageUrls.jpg.small;
        } else if (currentSrc.includes('/large/')) {
          target.src = this.imageUrls.jpg.large;
        } else {
          target.src = this.imageUrls.jpg.medium;
        }
      }
    }
  }
}
