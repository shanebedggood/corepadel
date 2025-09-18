import { render, RenderOptions } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Mock services
export const mockMessageService = {
  add: jest.fn(),
  clear: jest.fn(),
};

export const mockRouter = {
  navigate: jest.fn(),
  navigateByUrl: jest.fn(),
  url: '/test',
  events: {
    subscribe: jest.fn(),
  },
};

// Custom render function with common providers
export function renderWithProviders<T>(
  component: T,
  options: RenderOptions<T> = {}
) {
  return render(component, {
    ...options,
    providers: [
      { provide: MessageService, useValue: mockMessageService },
      { provide: Router, useValue: mockRouter },
      ...(options.providers || []),
    ],
    imports: [
      HttpClientTestingModule,
      NoopAnimationsModule,
      ...(options.imports || []),
    ],
  });
}

// Test setup helper
export function setupTestBed(moduleConfig: any) {
  return TestBed.configureTestingModule({
    ...moduleConfig,
    providers: [
      { provide: MessageService, useValue: mockMessageService },
      { provide: Router, useValue: mockRouter },
      ...(moduleConfig.providers || []),
    ],
    imports: [
      HttpClientTestingModule,
      NoopAnimationsModule,
      ...(moduleConfig.imports || []),
    ],
  });
}

// Common test data
export const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
};

export const mockClub = {
  id: 'test-club-id',
  name: 'Test Club',
  address: '123 Test Street',
};

export const mockTournament = {
  id: 'test-tournament-id',
  name: 'Test Tournament',
  startDate: '2024-01-01',
  endDate: '2024-01-02',
};
