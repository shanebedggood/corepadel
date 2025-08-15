import { Routes } from '@angular/router';
import { FirebaseAuthComponent } from './firebase-auth.component';

const authRoutes: Routes = [
  { path: 'verify-email', component: FirebaseAuthComponent },
  { path: 'signup', component: FirebaseAuthComponent },
  { path: '', component: FirebaseAuthComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

export default authRoutes; 