import { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

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

  constructor(private storage: Storage, private injector: Injector) {
    console.log('ImageUploadService initialized with storage:', storage);
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

      console.log('🔍 Storage connection details:');
      console.log('  - Storage instance:', this.storage);
      console.log('  - App:', this.storage.app);
      console.log('  - Project ID:', this.storage.app.options.projectId);
      console.log('  - Using production Firebase Storage');
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
    console.log('Starting profile picture upload for user:', userId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
    
    const uploadOptions = { ...this.DEFAULT_OPTIONS, ...options };
    console.log('Upload options:', uploadOptions);
    
    return from(this.processImage(file, uploadOptions)).pipe(
      switchMap(processedFile => {
        console.log('Image processed, uploading to Firebase...');
        return from(this.uploadToFirebase(processedFile, userId, uploadOptions));
      }),
      catchError(error => {
        console.error('Error in uploadProfilePicture:', error);
        return throwError(() => new Error(`Failed to process image: ${error?.message || 'Unknown error'}`));
      })
    );
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

      // Try to create a test reference
      const testRef = ref(this.storage, 'test-connection.txt');
      console.log('✅ Storage connection test successful:', testRef);
      return true;
    } catch (error: any) {
      console.error('❌ Storage connection test failed:', error);
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

      // Test storage connection first
      const isConnected = await this.testStorageConnection();
      if (!isConnected) {
        throw new Error('Firebase Storage connection test failed');
      }

      const fileName = options.fileName || `profile.${options.format}`;
      const filePath = `profile-pictures/${userId}/${fileName}`;
      
      console.log('Creating storage reference for path:', filePath);
      console.log('Storage instance:', this.storage);
      
      // Try to create storage reference
      let fileRef;
      try {
        fileRef = ref(this.storage, filePath);
        console.log('Storage reference created successfully:', fileRef);
      } catch (refError: any) {
        console.error('Failed to create storage reference:', refError);
        throw new Error(`Storage reference creation failed: ${refError.message}`);
      }

      console.log('Storage reference created:', fileRef);
      console.log('Uploading file to Firebase Storage...');
      
      const snapshot = await uploadBytes(fileRef, file);
      console.log('Upload snapshot:', snapshot);
      
      console.log('File uploaded successfully, getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('Download URL obtained:', downloadURL);
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading to Firebase:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });
      
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
}
