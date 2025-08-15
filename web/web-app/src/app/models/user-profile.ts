export interface UserProfile {
  user_id?: string; // Database UUID, optional since it might not be available
  firebase_uid: string; // Firebase user identifier
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
}
