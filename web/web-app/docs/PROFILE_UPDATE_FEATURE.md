# Profile Update Feature

## Overview

The Profile Update feature allows players to complete their profile information when they first log in or update their existing profile information. This feature ensures that all users have the necessary information in their profiles.

## Features

### Profile Update Component (`profile-update.component.ts`)

- **Profile Photo Upload**: Users can upload and change their profile photo
- **Personal Information**: 
  - First Name (required)
  - Last Name (required)
  - Display Name (required)
  - Email Address (read-only, cannot be changed)
- **Interests**: Users can select one or both of:
  - Padel
  - Running
- **Form Validation**: All required fields are validated
- **Skip Option**: Users can skip profile completion for now
- **Responsive Design**: Uses Tailwind CSS for modern, responsive UI

### Profile Completion Guard (`profile-completion.guard.ts`)

- **Automatic Redirect**: Redirects users to profile update if their profile is incomplete
- **Profile Completion Check**: Determines if a profile is complete based on:
  - `profile_completed` flag set to true, OR
  - Required fields (first name, last name, display name) are filled AND at least one interest is selected
- **Route Protection**: Applied to all player routes except the profile update route itself

### Enhanced Profile View (`profile.component.ts`)

- **Profile Display**: Shows all profile information including interests
- **Profile Photo**: Displays user's profile photo
- **Edit Button**: Direct link to profile update page
- **Interest Badges**: Visual display of user's selected interests

## Implementation Details

### Database Schema Updates

The following fields have been added to the user profile:

```sql
-- New fields in user table
ALTER TABLE users ADD COLUMN interests TEXT[]; -- Array of interests
ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE; -- Profile completion flag
```

### Interface Standardization

All user profile interfaces now use snake_case to match the database schema:

- `first_name` (string)
- `last_name` (string) 
- `display_name` (string)
- `email_verified` (boolean)
- `profile_picture` (string)
- `interests` (string[])
- `profile_completed` (boolean)

### API Endpoints

The following API endpoint has been added to the UserService:

```typescript
updateUserProfile(firebaseUid: string, profileData: any): Observable<User | null>
```

This endpoint updates the user profile by Firebase UID.

### Routing Configuration

The following routes have been added/modified:

```typescript
// Profile update route (no guard)
{ path: 'profile/update', component: ProfileUpdateComponent }

// Protected routes with ProfileCompletionGuard
{ path: '', component: Dashboard, canActivate: [ProfileCompletionGuard] }
{ path: 'profile', component: ProfileComponent, canActivate: [ProfileCompletionGuard] }
// ... other player routes
```

### User Interface

#### Profile Update Screen
- Clean, modern design using Tailwind CSS
- Form validation with error messages
- Profile photo upload with preview
- Interest selection with checkboxes
- Loading states and success/error notifications

#### Profile View Screen
- Displays all profile information
- Profile photo with avatar component
- Interest badges for visual appeal
- Edit button to navigate to update screen

## Usage Flow

1. **New User Login**: User logs in for the first time
2. **Profile Check**: ProfileCompletionGuard checks if profile is complete
3. **Redirect**: If incomplete, user is redirected to `/player/profile/update`
4. **Profile Update**: User fills out the profile form
5. **Save**: User saves profile or skips for later
6. **Access**: User can now access all player features

## Access Points

Users can access the profile update screen through:

1. **Automatic Redirect**: When profile is incomplete
2. **Topbar Menu**: User icon → "My Profile" → "Edit Profile" button
3. **Direct URL**: `/player/profile/update`

## Technical Notes

### Dependencies
- PrimeNG components: Card, Button, InputText, Checkbox, Toast, ProgressSpinner, Avatar
- Angular Reactive Forms for form handling
- Tailwind CSS for styling
- RxJS for reactive programming

### File Structure
```
web/web-app/src/app/
├── pages/profile/
│   ├── profile.component.ts (enhanced)
│   └── profile-update.component.ts (new)
├── guards/
│   └── profile-completion.guard.ts (new)
├── services/
│   └── user.service.ts (enhanced with updateUserProfile method)
└── models/
    └── user-profile.ts (enhanced with new fields)
```

### Future Enhancements

1. **File Upload Service**: Implement actual file upload to cloud storage
2. **Profile Picture Cropping**: Add image cropping functionality
3. **Additional Interests**: Expand interest options
4. **Profile Privacy Settings**: Add privacy controls
5. **Profile Verification**: Add profile verification features

## Testing

To test the profile update feature:

1. Log in as a new user
2. Verify redirect to profile update page
3. Fill out the form and save
4. Verify redirect to dashboard
5. Access profile page and verify information is displayed
6. Test edit functionality
7. Test skip functionality
8. Verify form validation works correctly
