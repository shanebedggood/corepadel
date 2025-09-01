export interface UserProfile {
  firebase_uid: string; // Firebase user identifier - single source of truth
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  email_verified?: boolean;
  roles: string[];
  mobile?: string;
  rating?: number;
  profile_picture?: string;
  interests?: string[];
  profile_completed?: boolean;
}
