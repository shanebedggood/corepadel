import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalImageService, ResponsiveImageUrls } from '../services/local-image.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-local-image-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Local Image Service Example</h2>
      
      <!-- Responsive Image URLs -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Responsive Image URLs</h3>
        @if (responsiveUrls) {
          <div class="space-y-2">
            <div><strong>WebP Small:</strong> {{ responsiveUrls.webp.small }}</div>
            <div><strong>WebP Medium:</strong> {{ responsiveUrls.webp.medium }}</div>
            <div><strong>WebP Large:</strong> {{ responsiveUrls.webp.large }}</div>
            <div><strong>JPG Small:</strong> {{ responsiveUrls.jpg.small }}</div>
            <div><strong>JPG Medium:</strong> {{ responsiveUrls.jpg.medium }}</div>
            <div><strong>JPG Large:</strong> {{ responsiveUrls.jpg.large }}</div>
          </div>
        }
      </div>

      <!-- Single Image URL -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Single Image URL</h3>
        @if (singleImageUrl) {
          <div>
            <strong>Large WebP:</strong> {{ singleImageUrl }}
          </div>
        }
      </div>

      <!-- Upload Example -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Upload Example (Placeholder)</h3>
        <input type="file" (change)="onFileSelected($event)" class="mb-2" />
        <button (click)="uploadFile()" class="px-4 py-2 bg-blue-500 text-white rounded">
          Upload File
        </button>
        @if (uploadedUrl) {
          <div class="mt-2">
            <strong>Uploaded URL:</strong> {{ uploadedUrl }}
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class LocalImageExampleComponent implements OnInit, OnDestroy {
  responsiveUrls: ResponsiveImageUrls | null = null;
  singleImageUrl: string | null = null;
  uploadedUrl: string | null = null;
  selectedFile: File | null = null;
  private subscription = new Subscription();

  constructor(private localImageService: LocalImageService) { }

  ngOnInit(): void {
    this.loadResponsiveUrls();
    this.loadSingleImageUrl();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadResponsiveUrls(): void {
    const subscription = this.localImageService.getResponsiveImageUrls('hero').subscribe({
      next: (urls) => {
        this.responsiveUrls = urls;
      },
      error: (error) => {
        console.error('Error loading responsive URLs:', error);
      }
    });
    this.subscription.add(subscription);
  }

  private loadSingleImageUrl(): void {
    const subscription = this.localImageService.getResponsiveImageUrl('hero', 'webp', 'large').subscribe({
      next: (url) => {
        this.singleImageUrl = url;
      },
      error: (error) => {
        console.error('Error loading single image URL:', error);
      }
    });
    this.subscription.add(subscription);
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      alert('Please select a file first');
      return;
    }

    const subscription = this.localImageService.uploadFile(this.selectedFile, 'uploads/').subscribe({
      next: (url) => {
        this.uploadedUrl = url;
      },
      error: (error) => {
        console.error('Error uploading file:', error);
      }
    });
    this.subscription.add(subscription);
  }
}
