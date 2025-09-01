import { TestBed } from '@angular/core/testing';
import { ImageUploadService } from './image-upload.service';
import { Storage } from '@angular/fire/storage';

describe('ImageUploadService', () => {
  let service: ImageUploadService;
  let mockStorage: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('Storage', ['ref']);
    
    TestBed.configureTestingModule({
      providers: [
        ImageUploadService,
        { provide: Storage, useValue: storageSpy }
      ]
    });
    
    service = TestBed.inject(ImageUploadService);
    mockStorage = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate image files correctly', () => {
    // Create a mock image file
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    const result = service.validateFile(mockFile);
    expect(result.isValid).toBe(true);
  });

  it('should reject non-image files', () => {
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    const result = service.validateFile(mockFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('image file');
  });

  it('should reject files larger than 10MB', () => {
    // Create a mock file with size > 10MB
    const largeArray = new Array(11 * 1024 * 1024).fill(0);
    const mockFile = new File(largeArray, 'large.jpg', { type: 'image/jpeg' });
    
    const result = service.validateFile(mockFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('10MB');
  });
});
