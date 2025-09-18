import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ResponsiveImageComponent } from './responsive-image.component';
import { LocalImageService, ResponsiveImageUrls } from '../services/local-image.service';

declare const createSpyObj: (name: string, methods: string[]) => any;

describe('ResponsiveImageComponent', () => {
  let component: ResponsiveImageComponent;
  let fixture: ComponentFixture<ResponsiveImageComponent>;
  let mockLocalImageService: any;

  const mockImageUrls: ResponsiveImageUrls = {
    webp: {
      small: '/images/small/test.webp',
      medium: '/images/medium/test.webp',
      large: '/images/large/test.webp'
    },
    jpg: {
      small: '/images/small/test.jpg',
      medium: '/images/medium/test.jpg',
      large: '/images/large/test.jpg'
    }
  };

  beforeEach(async () => {
    const localImageServiceSpy = createSpyObj('LocalImageService', ['getResponsiveImageUrls']);

    await TestBed.configureTestingModule({
      imports: [ResponsiveImageComponent],
      providers: [
        { provide: LocalImageService, useValue: localImageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResponsiveImageComponent);
    component = fixture.componentInstance;
    mockLocalImageService = TestBed.inject(LocalImageService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load image URLs on init', () => {
      mockLocalImageService.getResponsiveImageUrls.mockReturnValue(of(mockImageUrls));
      component.imageName = 'test';
      
      component.ngOnInit();
      
      expect(mockLocalImageService.getResponsiveImageUrls).toHaveBeenCalledWith('test');
      expect(component.imageUrls).toEqual(mockImageUrls);
    });

    it('should handle error when loading image URLs', () => {
      mockLocalImageService.getResponsiveImageUrls.mockReturnValue(throwError(() => new Error('Image not found')));
      component.imageName = 'nonexistent';
      
      component.ngOnInit();
      
      expect(mockLocalImageService.getResponsiveImageUrls).toHaveBeenCalledWith('nonexistent');
      expect(component.imageUrls).toBeNull();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from image service subscription', () => {
      mockLocalImageService.getResponsiveImageUrls.mockReturnValue(of(mockImageUrls));
      component.imageName = 'test';
      component.ngOnInit();
      
      if (component['subscription']) {
        jest.spyOn(component['subscription'], 'unsubscribe');
      }
      
      component.ngOnDestroy();
      
      expect(component['subscription']?.unsubscribe).toHaveBeenCalled();
    });

    it('should handle case when subscription is null', () => {
      component['subscription'] = null;
      
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('onImageError', () => {
    it('should handle image load error', () => {
      const mockEvent = {
        target: {
          src: '/images/medium/test.webp'
        }
      } as any;

      component.imageUrls = mockImageUrls;
      
      component.onImageError(mockEvent);
      
      expect(mockEvent.target.src).toBe('/images/medium/test.jpg');
    });

    it('should handle image load error when no fallback available', () => {
      const mockEvent = {
        target: {
          src: '/images/medium/test.webp'
        }
      } as any;

      component.imageUrls = {
        webp: {
          small: '/images/small/test.webp',
          medium: '/images/medium/test.webp',
          large: '/images/large/test.webp'
        },
        jpg: {
          small: '/images/small/test.jpg',
          medium: '/images/medium/test.jpg',
          large: '/images/large/test.jpg'
        }
      };
      
      component.onImageError(mockEvent);
      
      expect(mockEvent.target.src).toBe('/images/medium/test.jpg');
    });

    it('should handle image load error when imageUrls is null', () => {
      const mockEvent = {
        target: {
          src: '/images/medium/test.webp'
        }
      } as any;

      component.imageUrls = null;
      
      expect(() => component.onImageError(mockEvent)).not.toThrow();
    });
  });

  describe('template rendering', () => {
    it('should render picture element with sources', () => {
      mockLocalImageService.getResponsiveImageUrls.mockReturnValue(of(mockImageUrls));
      component.imageName = 'test';
      component.alt = 'Test image';
      component.cssClass = 'test-class';
      
      component.ngOnInit();
      fixture.detectChanges();
      
      const pictureElement = fixture.nativeElement.querySelector('picture');
      expect(pictureElement).toBeTruthy();
      
      const sources = fixture.nativeElement.querySelectorAll('source');
      expect(sources.length).toBe(2);
      
      const imgElement = fixture.nativeElement.querySelector('img');
      expect(imgElement).toBeTruthy();
      expect(imgElement.alt).toBe('Test image');
      expect(imgElement.className).toBe('test-class');
      expect(imgElement.getAttribute('loading')).toBe('lazy');
    });

    it('should render with default alt and cssClass when not provided', () => {
      mockLocalImageService.getResponsiveImageUrls.mockReturnValue(of(mockImageUrls));
      component.imageName = 'test';
      
      component.ngOnInit();
      fixture.detectChanges();
      
      const imgElement = fixture.nativeElement.querySelector('img');
      expect(imgElement.alt).toBe('');
      expect(imgElement.className).toBe('');
    });

    it('should set correct srcset attributes for WebP source', () => {
      mockLocalImageService.getResponsiveImageUrls.mockReturnValue(of(mockImageUrls));
      component.imageName = 'test';
      
      component.ngOnInit();
      fixture.detectChanges();
      
      const webpSource = fixture.nativeElement.querySelector('source[type="image/webp"]');
      expect(webpSource.srcset).toContain('/images/small/test.webp 480w');
      expect(webpSource.srcset).toContain('/images/medium/test.webp 768w');
      expect(webpSource.srcset).toContain('/images/large/test.webp 1200w');
    });

    it('should set correct srcset attributes for JPEG source', () => {
      mockLocalImageService.getResponsiveImageUrls.mockReturnValue(of(mockImageUrls));
      component.imageName = 'test';
      
      component.ngOnInit();
      fixture.detectChanges();
      
      const jpgSource = fixture.nativeElement.querySelector('source[type="image/jpeg"]');
      expect(jpgSource.srcset).toContain('/images/small/test.jpg 480w');
      expect(jpgSource.srcset).toContain('/images/medium/test.jpg 768w');
      expect(jpgSource.srcset).toContain('/images/large/test.jpg 1200w');
    });

    it('should set correct src attribute for img element', () => {
      mockLocalImageService.getResponsiveImageUrls.mockReturnValue(of(mockImageUrls));
      component.imageName = 'test';
      
      component.ngOnInit();
      fixture.detectChanges();
      
      const imgElement = fixture.nativeElement.querySelector('img');
      expect(imgElement.src).toContain('/images/medium/test.webp');
    });
  });
});
