import { Routes } from '@angular/router';
import { EmailInputComponent } from './email-input';
import { SignupComponent } from './signup';
import { CheckEmailComponent } from './check-email';
import { VerifyEmailComponent } from './verify-email';

const authRoutes: Routes = [
  { path: 'email-input', component: EmailInputComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'check-email', component: CheckEmailComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: '', redirectTo: 'email-input', pathMatch: 'full' }
];

export default authRoutes; 