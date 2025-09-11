# Error Handling Migration Guide

This guide shows how to migrate existing components from direct `MessageService` usage to the new `ErrorHandlerService` pattern.

## Before (Old Pattern)

```typescript
import { MessageService } from 'primeng/api';

@Component({
  // ...
  providers: [MessageService]
})
export class MyComponent {
  constructor(private messageService: MessageService) {}

  async someMethod() {
    try {
      // Some operation
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Operation completed successfully',
        life: 0 // Sticky
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Something went wrong',
        life: 0 // Sticky
      });
    }
  }
}
```

## After (New Pattern)

```typescript
import { ErrorHandlerService } from '../services/error-handler.service';

@Component({
  // ...
  // Remove MessageService from providers
})
export class MyComponent {
  constructor(private errorHandlerService: ErrorHandlerService) {}

  async someMethod() {
    try {
      // Some operation
      this.errorHandlerService.handleSuccess('Operation completed successfully');
    } catch (error) {
      this.errorHandlerService.handleApiError(error, 'Operation');
    }
  }
}
```

## Migration Steps

### 1. Update Imports
```typescript
// Remove
import { MessageService } from 'primeng/api';

// Add
import { ErrorHandlerService } from '../services/error-handler.service';
```

### 2. Update Constructor
```typescript
// Remove
constructor(private messageService: MessageService) {}

// Add
constructor(private errorHandlerService: ErrorHandlerService) {}
```

### 3. Update Component Providers
```typescript
@Component({
  // ...
  // Remove this line:
  // providers: [MessageService]
})
```

### 4. Replace MessageService Calls

#### Success Messages
```typescript
// Old
this.messageService.add({
  severity: 'success',
  summary: 'Success',
  detail: 'Operation completed',
  life: 0
});

// New
this.errorHandlerService.handleSuccess('Operation completed');
```

#### Error Messages
```typescript
// Old
this.messageService.add({
  severity: 'error',
  summary: 'Error',
  detail: error.message || 'Something went wrong',
  life: 0
});

// New
this.errorHandlerService.handleApiError(error, 'Operation Context');
```

#### Info Messages
```typescript
// Old
this.messageService.add({
  severity: 'info',
  summary: 'Info',
  detail: 'Information message',
  life: 5000
});

// New
this.errorHandlerService.handleInfo('Information message');
```

#### Warning Messages
```typescript
// Old
this.messageService.add({
  severity: 'warn',
  summary: 'Warning',
  detail: 'Warning message',
  life: 8000
});

// New
this.errorHandlerService.handleWarning('Warning message');
```

#### Validation Errors
```typescript
// Old
this.messageService.add({
  severity: 'error',
  summary: 'Validation Error',
  detail: 'Field is required',
  life: 0
});

// New
this.errorHandlerService.handleValidationError('Field Name', 'Field is required');
```

### 5. Remove Toast Template
```html
<!-- Remove this from template -->
<p-toast></p-toast>
```

The toast is now handled globally in `app.layout.ts`.

## Example: Firebase Auth Component Migration

### Before
```typescript
// firebase-auth.component.ts
import { MessageService } from 'primeng/api';

@Component({
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <!-- rest of template -->
  `
})
export class FirebaseAuthComponent {
  constructor(private messageService: MessageService) {}

  async sendSignInLink() {
    if (!this.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter your email address',
        life: 0
      });
      return;
    }

    try {
      await this.firebaseAuth.sendSignInLink(this.email);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Sign-in link sent to your email',
        life: 0
      });
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to send sign-in link',
        life: 0
      });
    }
  }
}
```

### After
```typescript
// firebase-auth.component.ts
import { ErrorHandlerService } from '../../services/error-handler.service';

@Component({
  // Remove providers: [MessageService]
  template: `
    <!-- Remove <p-toast></p-toast> -->
    <!-- rest of template -->
  `
})
export class FirebaseAuthComponent {
  constructor(private errorHandlerService: ErrorHandlerService) {}

  async sendSignInLink() {
    if (!this.email) {
      this.errorHandlerService.handleValidationError('Email', 'Please enter your email address');
      return;
    }

    try {
      await this.firebaseAuth.sendSignInLink(this.email);
      this.errorHandlerService.handleSuccess('Sign-in link sent to your email');
    } catch (error: any) {
      this.errorHandlerService.handleApiError(error, 'Sign-in Link');
    }
  }
}
```

## Benefits of Migration

1. **Consistent Error Handling**: All errors follow the same pattern
2. **Automatic Lifetime Management**: Success/info auto-dismiss, errors stay sticky
3. **Deduplication**: Prevents spam messages
4. **Better UX**: Proper error categorization and user-friendly messages
5. **Centralized Configuration**: Easy to update error messages globally
6. **Mobile Responsive**: Error messages work well on all devices

## Components to Migrate

The following components still need migration:

- `knockout-bracket.component.ts`
- `tournament-matches.component.ts`
- `edit-tournament.component.ts`
- `tournament-knockout-matches.component.ts`
- `match-schedule.component.ts`
- `create-tournament.component.ts`
- `run-booking.component.ts`
- `firebase-auth.component.ts`
- `profile-update.component.ts`
- `tournament-groups.component.ts`

## Testing After Migration

1. Test all error scenarios
2. Verify success messages appear and auto-dismiss
3. Check that error messages are sticky
4. Test on mobile devices
5. Verify no duplicate messages appear
6. Check that persistent messages work correctly
