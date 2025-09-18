import { TestBed } from '@angular/core/testing';
import { ImageUploadService } from './image-upload.service';
import { Storage } from '@angular/fire/storage';

// Mock Firebase storage
jest.mock('../../environments/firebase.config', () => ({
  storage: {
    ref: jest.fn(),
  }
}));

// Mock DOM APIs
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
  })),
  toBlob: jest.fn((callback) => {
    const blob = new Blob(['test'], { type: 'image/webp' });
    callback(blob);
  }),
};

const mockImage = {
  width: 100,
  height: 100,
  onload: null,
  onerror: null,
  src: '',
};

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement
Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName) => {
    if (tagName === 'canvas') {
      return mockCanvas;
    }
    if (tagName === 'img') {
      return mockImage;
    }
    return {};
  }),
});

// Mock Image constructor
global.Image = jest.fn(() => mockImage) as any;

describe('ImageUploadService', () => {
  let service: ImageUploadService;
  let mockStorage: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    const storageSpy = {
      ref: jest.fn(),
    };
    
    TestBed.configureTestingModule({
      providers: [
        ImageUploadService,
        { provide: Storage, useValue: storageSpy }
      ]
    });
    
    service = TestBed.inject(ImageUploadService);
    mockStorage = TestBed.inject(Storage);
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
    // Create a mock file with size > 10MB (using a more memory-efficient approach)
    const mockFile = new File(['test'], 'large.jpg', { type: 'image/jpeg' });
    // Mock the size property to simulate a large file
    Object.defineProperty(mockFile, 'size', {
      value: 11 * 1024 * 1024, // 11MB
      writable: false
    });
    
    const result = service.validateFile(mockFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('10MB');
  });
});
