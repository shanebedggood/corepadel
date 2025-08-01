import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalImageService, ResponsiveImageUrls } from './local-image.service';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveImageService {

  constructor(private localImageService: LocalImageService) { }

  /**
   * Get responsive image URLs for a given image name
   * @param imageName - The base name of the image (e.g., 'hero')
   * @returns Observable of ResponsiveImageUrls object
   */
  getResponsiveImageUrls(imageName: string): Observable<ResponsiveImageUrls> {
    return this.localImageService.getResponsiveImageUrls(imageName);
  }
}
