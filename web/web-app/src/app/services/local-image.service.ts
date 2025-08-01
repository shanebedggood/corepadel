import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ResponsiveImageUrls {
    webp: {
        small: string;
        medium: string;
        large: string;
    };
    jpg: {
        small: string;
        medium: string;
        large: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class LocalImageService {

    private readonly basePath = '/assets/images';

    constructor() { }

    /**
     * Get responsive image URLs for a given image name
     * @param imageName - The base name of the image (e.g., 'hero')
     * @returns Observable of ResponsiveImageUrls object
     */
    getResponsiveImageUrls(imageName: string): Observable<ResponsiveImageUrls> {
        const urls: ResponsiveImageUrls = {
            webp: {
                small: `${this.basePath}/small/${imageName}.webp`,
                medium: `${this.basePath}/medium/${imageName}.webp`,
                large: `${this.basePath}/large/${imageName}.webp`
            },
            jpg: {
                small: `${this.basePath}/small/${imageName}.jpg`,
                medium: `${this.basePath}/medium/${imageName}.jpg`,
                large: `${this.basePath}/large/${imageName}.jpg`
            }
        };

        return of(urls);
    }

    /**
     * Get a single responsive image URL
     * @param imageName - The base name of the image
     * @param format - The format ('webp' or 'jpg')
     * @param size - The size ('small', 'medium', or 'large')
     * @returns Observable of the image URL
     */
    getResponsiveImageUrl(
        imageName: string,
        format: 'webp' | 'jpg',
        size: 'small' | 'medium' | 'large'
    ): Observable<string> {
        const url = `${this.basePath}/${size}/${imageName}.${format}`;
        return of(url);
    }

    /**
     * Get a sponsor image URL
     * @param imageName - The base name of the image (e.g., 'wattshot')
     * @returns Observable of the image URL
     */
    getSponsorImageUrl(imageName: string): Observable<string> {
        // Try webp first, then png, then jpg
        const webpUrl = `${this.basePath}/sponsors/${imageName}.webp`;
        const pngUrl = `${this.basePath}/sponsors/${imageName}.png`;
        const jpgUrl = `${this.basePath}/sponsors/${imageName}.jpg`;

        // For now, return webp as primary, with fallback logic in components
        return of(webpUrl);
    }

    /**
     * Get a single image URL
     * @param path - The path to the image (e.g., 'hero/desktop/hero-desktop.webp')
     * @returns Observable of the image URL
     */
    getImageUrl(path: string): Observable<string> {
        const url = `${this.basePath}/${path}`;
        return of(url);
    }

    /**
     * Upload a file (placeholder - for compatibility)
     * @param file - The file to upload
     * @param path - The storage path
     * @param fileName - Optional custom filename
     * @returns Observable of the download URL
     */
    uploadFile(
        file: File,
        path: string,
        fileName?: string
    ): Observable<string> {
        // This is a placeholder for compatibility
        // In a real implementation, you might want to:
        // 1. Upload to your own server
        // 2. Use a CDN service
        // 3. Use cloud storage like AWS S3, Google Cloud Storage, etc.
        
        console.warn('File upload not implemented in LocalImageService. Consider implementing a proper file upload solution.');
        
        // Return a placeholder URL
        const timestamp = Date.now();
        const name = fileName || `${timestamp}_${file.name}`;
        const url = `${this.basePath}/${path}${name}`;
        
        return of(url);
    }

    /**
     * Delete a file (placeholder - for compatibility)
     * @param filePath - The storage path of the file to delete
     * @returns Observable that completes when deletion is done
     */
    deleteFile(filePath: string): Observable<void> {
        console.warn('File deletion not implemented in LocalImageService');
        return of(void 0);
    }

    /**
     * List all files in a directory (placeholder - for compatibility)
     * @param path - The storage path to list
     * @returns Observable of file references
     */
    listFiles(path: string): Observable<any[]> {
        console.warn('File listing not implemented in LocalImageService');
        return of([]);
    }

    /**
     * Upload multiple files (placeholder - for compatibility)
     * @param files - Array of files to upload
     * @param path - The storage path
     * @returns Observable of array of download URLs
     */
    uploadMultipleFiles(
        files: File[],
        path: string
    ): Observable<string[]> {
        console.warn('Multiple file upload not implemented in LocalImageService');
        return of([]);
    }

    /**
     * Delete multiple files (placeholder - for compatibility)
     * @param filePaths - Array of file paths to delete
     * @returns Observable that completes when all deletions are done
     */
    deleteMultipleFiles(filePaths: string[]): Observable<void> {
        console.warn('Multiple file deletion not implemented in LocalImageService');
        return of(void 0);
    }
} 