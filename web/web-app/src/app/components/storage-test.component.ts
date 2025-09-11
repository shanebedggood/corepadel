import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Storage } from '@angular/fire/storage';
import { ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-storage-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h2>Firebase Storage Test</h2>
      
      <div class="mb-4">
        <p><strong>Storage Available:</strong> {{ storageAvailable ? 'Yes' : 'No' }}</p>
        <p><strong>Storage Instance:</strong> {{ storageInstance }}</p>
      </div>

      <div class="mb-4">
        <input type="file" (change)="onFileSelected($event)" accept="image/*" />
        <button (click)="testUpload()" [disabled]="!selectedFile" class="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
          Test Upload
        </button>
      </div>

      @if (uploadResult) {
        <div class="mb-4">
          <h3>Upload Result:</h3>
          <pre>{{ uploadResult | json }}</pre>
        </div>
      }

      @if (error) {
        <div class="mb-4 text-red-500">
          <h3>Error:</h3>
          <pre>{{ error }}</pre>
        </div>
      }
    </div>
  `
})
export class StorageTestComponent {
  storageAvailable = false;
  storageInstance = 'Not available';
  selectedFile: File | null = null;
  uploadResult: any = null;
  error: string | null = null;

  constructor(private storage: Storage) {
    this.checkStorage();
  }

  private checkStorage() {
    try {
      this.storageAvailable = !!this.storage;
      this.storageInstance = this.storage ? 'Available' : 'Not available';
    } catch (error) {
      console.error('Storage check failed:', error);
      this.storageAvailable = false;
      this.storageInstance = 'Error checking storage';
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.error = null;
    this.uploadResult = null;
  }

  async testUpload() {
    if (!this.selectedFile) return;

    try {
      this.error = null;
      this.uploadResult = null;

      // Create a simple test path
      const testPath = `test/${Date.now()}-${this.selectedFile.name}`;
      
      const fileRef = ref(this.storage, testPath);
      
      const snapshot = await uploadBytes(fileRef, this.selectedFile);
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      this.uploadResult = {
        path: testPath,
        downloadURL,
        metadata: snapshot.metadata
      };
      
    } catch (error: any) {
      console.error('Test upload failed:', error);
      this.error = error.message || 'Unknown error';
    }
  }
}
