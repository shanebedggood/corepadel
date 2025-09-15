import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { storage } from '../../environments/firebase.config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fileName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  
  private readonly DEFAULT_OPTIONS: ImageUploadOptions = {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.8,
    format: 'webp'
  };

  private storage = storage;
  
  // Browser cache for profile images
  private imageCache = new Map<string, { url: string; timestamp: number }>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor() {
    this.verifyStorageConnection();
  }

  /**
   * Verify that Firebase Storage is properly connected
   */
  private verifyStorageConnection(): void {
    try {
      if (!this.storage) {
        console.error('❌ Firebase Storage is not available');
        return;
      }
    } catch (error) {
      console.error('❌ Error verifying storage connection:', error);
    }
  }

  /**
   * Upload and resize a profile picture
   * @param file - The original file
   * @param userId - User ID for storage path
   * @param options - Upload options
   * @returns Observable of the download URL
   */
  uploadProfilePicture(
    file: File, 
    userId: string, 
    options: ImageUploadOptions = {}
  ): Observable<string> {
    const uploadOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    return from(this.processImage(file, uploadOptions)).pipe(
      switchMap(processedFile => {
        return from(this.uploadToFirebase(processedFile, userId, uploadOptions));
      }),
      map(downloadURL => {
        // Cache the uploaded image URL
        this.cacheImageUrl(userId, downloadURL);
        return downloadURL;
      }),
      catchError(error => {
        console.error('Error in uploadProfilePicture:', error);
        return throwError(() => new Error(`Failed to process image: ${error?.message || 'Unknown error'}`));
      })
    );
  }

  /**
   * Get cached profile image URL or fetch from Firebase
   * @param userId - User ID
   * @param imageUrl - The image URL from user profile
   * @returns Observable of the cached or fetched URL
   */
  getCachedProfileImage(userId: string, imageUrl?: string): Observable<string | null> {
    // Check if we have a cached version
    const cached = this.getCachedImageUrl(userId);
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    // If no cache and no imageUrl provided, return null
    if (!imageUrl) {
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }

    // Cache the provided URL and return it
    this.cacheImageUrl(userId, imageUrl);
    return new Observable(observer => {
      observer.next(imageUrl);
      observer.complete();
    });
  }

  /**
   * Delete a profile picture
   * @param userId - User ID
   * @param fileName - Optional specific filename
   * @returns Observable that completes when deletion is done
   */
  deleteProfilePicture(userId: string, fileName?: string): Observable<void> {
    const filePath = `profile-pictures/${userId}/${fileName || 'profile.webp'}`;
    // Get the underlying Firebase Storage instance
    const firebaseStorage = this.storage;
    const fileRef = ref(firebaseStorage, filePath);
    
    return from(deleteObject(fileRef));
  }

  /**
   * Process image: resize, compress, and convert format
   */
  private async processImage(file: File, options: ImageUploadOptions): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions maintaining aspect ratio
          const { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            options.maxWidth!, 
            options.maxHeight!
          );

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw resized image
          ctx!.drawImage(img, 0, 0, width, height);

          // Convert to blob with specified format and quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const fileName = options.fileName || `profile.${options.format}`;
                const processedFile = new File([blob], fileName, {
                  type: `image/${options.format}`,
                  lastModified: Date.now()
                });
                resolve(processedFile);
              } else {
                reject(new Error('Failed to process image'));
              }
            },
            `image/${options.format}`,
            options.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate new dimensions maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Calculate scaling factors
    const scaleX = maxWidth / width;
    const scaleY = maxHeight / height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't upscale

    // Apply scaling
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    return { width, height };
  }

  /**
   * Test storage connection by creating a simple reference
   */
  private async testStorageConnection(): Promise<boolean> {
    try {
      if (!this.storage) {
        console.error('❌ Storage instance is null');
        return false;
      }

      // Try to create a test reference - this should work if storage is properly initialized
      const testRef = ref(this.storage, 'test-connection.txt');
      return true;
    } catch (error: any) {
      console.error('❌ Storage connection test failed:', error);
      console.error('Storage instance details:', {
        storage: this.storage,
        storageType: typeof this.storage,
        storageConstructor: this.storage?.constructor?.name
      });
      return false;
    }
  }

  /**
   * Upload processed file to Firebase Storage
   */
  private async uploadToFirebase(
    file: File, 
    userId: string, 
    options: ImageUploadOptions
  ): Promise<string> {
    try {
      // Check if storage is available
      if (!this.storage) {
        throw new Error('Firebase Storage is not available');
      }

      const fileName = options.fileName || `profile.${options.format}`;
      const filePath = `profile-pictures/${userId}/${fileName}`;
      
      // Create storage reference
      const fileRef = ref(this.storage, filePath);
      
      // Upload file
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading to Firebase:', error);
      throw new Error(`Failed to upload image: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Validate file before processing
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Please select an image file' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }

    return { isValid: true };
  }

  /**
   * Cache an image URL for a user
   * @param userId - User ID
   * @param imageUrl - Image URL to cache
   */
  private cacheImageUrl(userId: string, imageUrl: string): void {
    this.imageCache.set(userId, {
      url: imageUrl,
      timestamp: Date.now()
    });
  }

  /**
   * Get cached image URL for a user
   * @param userId - User ID
   * @returns Cached URL if valid, null otherwise
   */
  private getCachedImageUrl(userId: string): string | null {
    const cached = this.imageCache.get(userId);
    if (!cached) {
      return null;
    }

    // Check if cache is still valid
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      // Cache expired, remove it
      this.imageCache.delete(userId);
      return null;
    }

    return cached.url;
  }

  /**
   * Clear cache for a specific user
   * @param userId - User ID
   */
  clearUserImageCache(userId: string): void {
    this.imageCache.delete(userId);
  }

  /**
   * Clear all cached images
   */
  clearAllImageCache(): void {
    this.imageCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: Array<{ userId: string; timestamp: number }> } {
    const entries = Array.from(this.imageCache.entries()).map(([userId, data]) => ({
      userId,
      timestamp: data.timestamp
    }));

    return {
      size: this.imageCache.size,
      entries
    };
  }
}
