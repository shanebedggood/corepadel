import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerService,
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    });

    service = TestBed.inject(ErrorHandlerService);
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showToast', () => {
    it('should show success toast with 4 second lifetime', () => {
      service.showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Operation completed'
      });

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Operation completed',
        life: 4000
      });
    });

    it('should show error toast with sticky lifetime', () => {
      service.showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong'
      });

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 0
      });
    });

    it('should respect custom lifetime', () => {
      service.showToast({
        severity: 'info',
        summary: 'Info',
        detail: 'Information',
        life: 10000
      });

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Info',
        detail: 'Information',
        life: 10000
      });
    });
  });

  describe('handleApiError', () => {
    it('should show persistent error for 401 status', () => {
      const error = { status: 401, message: 'Unauthorized' };
      spyOn(service, 'showPersistentError');

      service.handleApiError(error, 'Authentication');

      expect(service.showPersistentError).toHaveBeenCalledWith(
        'Authentication',
        'You are not authenticated. Please log in again.'
      );
    });

    it('should show toast for 400 status', () => {
      const error = { status: 400, message: 'Bad Request' };
      spyOn(service, 'showToast');

      service.handleApiError(error, 'API Request');

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'API Request',
        detail: 'Invalid request. Please check your input.'
      });
    });

    it('should use error message when available', () => {
      const error = { status: 400, error: { message: 'Custom error message' } };
      spyOn(service, 'showToast');

      service.handleApiError(error, 'API Request');

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'API Request',
        detail: 'Custom error message'
      });
    });
  });

  describe('handleSuccess', () => {
    it('should show success toast', () => {
      spyOn(service, 'showToast');

      service.handleSuccess('Operation completed', 'Success');

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Operation completed'
      });
    });
  });

  describe('handleValidationError', () => {
    it('should show validation error toast', () => {
      spyOn(service, 'showToast');

      service.handleValidationError('Email', 'Email is required');

      expect(service.showToast).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Email: Email is required'
      });
    });
  });
});
