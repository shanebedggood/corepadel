# Error Handling UX Guidelines

This document outlines the error handling patterns and UX guidelines for the Core Padel application.

## Overview

The application uses a comprehensive error handling system with multiple layers:
- **Global HTTP Error Interceptor**: Catches API errors automatically
- **Global Error Handler**: Catches uncaught application errors
- **Toast Notifications**: For temporary feedback
- **Persistent Messages**: For critical errors requiring user action
- **Form Validation**: For input validation errors

## Error Types and Display Methods

### 1. Toast Notifications (Temporary)

**Use for:**
- Success confirmations
- Informational messages
- Non-critical errors
- Quick feedback

**Lifetimes:**
- **Success**: 4 seconds (auto-dismiss)
- **Info**: 5 seconds (auto-dismiss)
- **Warning**: 8 seconds (auto-dismiss)
- **Error**: Sticky (manual dismiss)

**Example:**
```typescript
this.errorHandlerService.showToast({
  severity: 'success',
  summary: 'Tournament Created',
  detail: 'Your tournament has been created successfully.'
});
```

### 2. Persistent Messages (Critical)

**Use for:**
- Authentication errors (401, 403)
- Network connectivity issues
- Server errors (5xx)
- Critical system errors
- Errors requiring user action

**Features:**
- User-dismissible
- Timestamp display
- Clear all button
- Mobile-responsive
- Stacks multiple messages

**Example:**
```typescript
this.errorHandlerService.showPersistentError(
  'Authentication',
  'Your session has expired. Please log in again.'
);
```

### 3. Form Validation Errors

**Use for:**
- Input validation
- Field-specific errors
- Form submission errors

**Components:**
- `FormFieldErrorComponent`: Shows field-specific errors
- `FormSubmitUxDirective`: Handles form submission UX
- `FormErrorService`: Utilities for form error handling

**Example:**
```html
<input formControlName="email" />
<app-form-field-error 
  [control]="form.get('email')" 
  fieldName="Email"
  [showOnSubmit]="true"
  [submitted]="formSubmitted">
</app-form-field-error>
```

## Error Mapping

### HTTP Status Codes

| Status | Display Method | User Action Required |
|--------|---------------|---------------------|
| 400 | Toast | No |
| 401 | Persistent | Yes (re-authenticate) |
| 403 | Persistent | Yes (check permissions) |
| 404 | Toast | No |
| 409 | Toast | No |
| 422 | Toast | No |
| 429 | Persistent | Yes (wait and retry) |
| 5xx | Persistent | Yes (retry later) |
| Network | Persistent | Yes (check connection) |

### Firebase Auth Errors

| Error Code | Display Method | Message |
|------------|---------------|---------|
| auth/user-not-found | Toast | User not found. Please check your credentials. |
| auth/wrong-password | Toast | Incorrect password. Please try again. |
| auth/invalid-email | Toast | Invalid email address. Please check your email. |
| auth/email-already-in-use | Toast | This email is already registered. |
| auth/weak-password | Toast | Password is too weak. |
| auth/network-request-failed | Persistent | Network error. Please check your connection. |
| auth/too-many-requests | Persistent | Too many failed attempts. Please try again later. |

## Best Practices

### 1. Error Message Writing

**Do:**
- Use clear, actionable language
- Be specific about what went wrong
- Provide guidance on how to fix it
- Use consistent terminology

**Don't:**
- Use technical jargon
- Blame the user
- Be vague or generic
- Show raw error codes to users

**Examples:**
```
✅ Good: "Tournament not found. Please check the tournament ID and try again."
❌ Bad: "HTTP 404: Resource not found"

✅ Good: "Password must be at least 8 characters long."
❌ Bad: "Validation failed"
```

### 2. Error Handling in Components

**Use ErrorHandlerService:**
```typescript
// Instead of direct MessageService calls
this.errorHandlerService.handleApiError(error, 'Tournament Creation');

// For success messages
this.errorHandlerService.handleSuccess('Tournament created successfully');

// For validation errors
this.errorHandlerService.handleValidationError('Email', 'Invalid email format');
```

**Handle Errors in Services:**
```typescript
// Notify user and rethrow for component handling
catchError(error => {
  this.errorHandlerService.handleApiError(error, 'User Service');
  return throwError(() => error);
})
```

### 3. Form Error Handling

**Use Form Components:**
```html
<form [formGroup]="form" appFormSubmitUx 
      [appFormSubmitUx]="form"
      [scrollToFirstError]="true"
      [showValidationOnSubmit]="true"
      (formValid)="onFormValid($event)">
  
  <input formControlName="name" />
  <app-form-field-error 
    [control]="form.get('name')" 
    fieldName="Name"
    [showOnSubmit]="true"
    [submitted]="formSubmitted">
  </app-form-field-error>
  
  <button type="submit" [disabled]="form.invalid">
    Submit
  </button>
</form>
```

### 4. Toast Deduplication

**Automatic Features:**
- Duplicate messages within 5 seconds are ignored
- After 3 duplicates, shows consolidated message
- Maximum 4 concurrent toasts
- Queuing for additional messages

**Manual Control:**
```typescript
// Use key for specific deduplication
this.stickyMessageService.add({
  severity: 'error',
  summary: 'Network Error',
  detail: 'Connection failed',
  key: 'network-error' // Prevents duplicates with same key
});
```

## Implementation Checklist

### For New Features:
- [ ] Use `ErrorHandlerService` instead of direct `MessageService`
- [ ] Implement proper form validation with `FormFieldErrorComponent`
- [ ] Add error handling to all API calls
- [ ] Test error scenarios (network failures, validation errors)
- [ ] Ensure mobile responsiveness of error messages

### For Existing Features:
- [ ] Replace direct `MessageService` calls with `ErrorHandlerService`
- [ ] Update form validation to use new components
- [ ] Remove hardcoded `life: 0` from toast calls
- [ ] Test error handling behavior

## Testing Error Handling

### Manual Testing:
1. **Network Errors**: Disconnect internet and test API calls
2. **Validation Errors**: Submit forms with invalid data
3. **Authentication Errors**: Test with expired/invalid tokens
4. **Server Errors**: Test with backend down scenarios
5. **Mobile Testing**: Verify error messages on mobile devices

### Automated Testing:
```typescript
// Test error interceptor
it('should handle 401 errors with persistent message', () => {
  // Test implementation
});

// Test form validation
it('should show validation errors on submit', () => {
  // Test implementation
});
```

## Monitoring and Analytics

### Error Tracking:
- All errors are logged to console with context
- Persistent errors include timestamp and user context
- Consider integrating with error reporting service (Sentry, etc.)

### Metrics to Track:
- Error frequency by type
- User actions after errors
- Error resolution rates
- Mobile vs desktop error patterns

## Migration Guide

### From Direct MessageService:
```typescript
// Old way
this.messageService.add({
  severity: 'error',
  summary: 'Error',
  detail: 'Something went wrong',
  life: 0
});

// New way
this.errorHandlerService.showToast({
  severity: 'error',
  summary: 'Error',
  detail: 'Something went wrong'
});
```

### From Manual Error Handling:
```typescript
// Old way
catchError(error => {
  console.error(error);
  // Manual error handling
  return of(null);
});

// New way
catchError(error => {
  this.errorHandlerService.handleApiError(error, 'Context');
  return throwError(() => error);
});
```

## Troubleshooting

### Common Issues:

1. **Toasts not showing**: Check if `p-toast` is in template
2. **Persistent messages not appearing**: Verify `PersistentMessagesComponent` is imported
3. **Form errors not displaying**: Ensure `FormFieldErrorComponent` is used correctly
4. **Duplicate toasts**: Check if deduplication is working as expected

### Debug Mode:
Enable detailed error logging by setting `console.log` level to debug in development environment.
