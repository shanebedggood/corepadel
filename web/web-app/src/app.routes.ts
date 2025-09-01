import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { PlayerLayoutComponent } from './app/layout/component/player-layout.component';
import { AdminLayoutComponent } from './app/layout/component/admin-layout.component';
import { RoleSwitcherComponent } from './app/pages/auth/role-switcher.component';


import { Dashboard } from './app/pages/dashboard/dashboard';
import { Landing } from './app/pages/landing/landing';
import { NotfoundComponent } from './app/pages/notfound/notfound';
import { Rules } from './app/pages/rules/rules';
import { ZaDestComponent } from './app/pages/dest/za/zadest';
import { AuthGuard } from './app/guards/auth.guard';
import { AdminGuard } from './app/guards/admin.guard';
import { TestRolesComponent } from './app/pages/test-roles/test-roles.component';
import { TournamentsComponent } from './app/pages/tournaments/components/tournaments/tournaments.component';
import { CreateTournamentComponent } from './app/pages/tournaments/components/create-tournament/create-tournament.component';
import { EditTournamentComponent } from './app/pages/tournaments/components/edit-tournament/edit-tournament.component';
import { AddTeamComponent } from './app/pages/tournaments/components/add-team/add-team.component';
import { StandingsComponent } from './app/pages/tournaments/components/standings/standings.component';
import { MatchScheduleComponent } from './app/pages/tournaments/components/match-schedule/match-schedule.component';
import { AdminComponent } from './app/pages/admin/admin.component';
import { AdminSetupComponent } from './app/pages/admin/admin-setup.component';
import { ProfileComponent } from './app/pages/profile/profile.component';
import { ProfileUpdateComponent } from './app/pages/profile/profile-update.component';
import { ProfileCompletionGuard } from './app/guards/profile-completion.guard';
import authRoutes from './app/pages/auth/auth.routes';

export const appRoutes: Routes = [
    // Public routes (no authentication required)
    { path: '', component: Landing },
    { path: 'landing', component: Landing },
    { path: 'auth', children: authRoutes },
    
    // Protected routes (authentication required)
    { path: 'choose-role', component: RoleSwitcherComponent, canActivate: [AuthGuard] },
    { path: 'rules', component: Rules, canActivate: [AuthGuard] },
    { path: 'dest/za', component: ZaDestComponent, canActivate: [AuthGuard] },
    {
        path: 'player',
        component: PlayerLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: Dashboard, canActivate: [ProfileCompletionGuard] },
            { path: 'standings/:tournamentId', component: StandingsComponent, data: { title: 'Tournament Standings' }, canActivate: [ProfileCompletionGuard] },
            { path: 'rules', component: Rules, canActivate: [ProfileCompletionGuard] },
            { path: 'tournaments', component: TournamentsComponent, canActivate: [ProfileCompletionGuard] },
            { path: 'matches', component: Dashboard, canActivate: [ProfileCompletionGuard] }, // Placeholder for player matches
            { path: 'teams', component: Dashboard, canActivate: [ProfileCompletionGuard] }, // Placeholder for player teams
            { path: 'profile', component: ProfileComponent, canActivate: [ProfileCompletionGuard] },
            { path: 'profile/update', component: ProfileUpdateComponent },
            { path: 'destinations', component: ZaDestComponent, canActivate: [ProfileCompletionGuard] },
            { path: 'destinations/clubs', component: ZaDestComponent, canActivate: [ProfileCompletionGuard] },
            { path: 'destinations/events/kids', component: ZaDestComponent, canActivate: [ProfileCompletionGuard] },
            { path: 'destinations/events/social', component: ZaDestComponent, canActivate: [ProfileCompletionGuard] },
            { path: 'destinations/events/corporate', component: ZaDestComponent, canActivate: [ProfileCompletionGuard] }
        ]
    },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [AuthGuard, AdminGuard],
        children: [
            { path: '', component: AdminComponent },
            { path: 'setup', component: AdminSetupComponent, data: { title: 'Admin Setup' } },
            { path: 'tournaments', component: TournamentsComponent, data: { title: 'Tournaments' } },
            { path: 'create-tournament', component: CreateTournamentComponent },
            { path: 'edit-tournament/:id', component: EditTournamentComponent },
            { path: 'tournaments/:tournamentId/groups/:groupId/add-team', component: AddTeamComponent },
            { path: 'tournaments/:tournamentId/groups/:groupId/teams/:teamId/edit', component: AddTeamComponent },
            { path: 'match-schedule/:id', component: MatchScheduleComponent, data: { title: 'Match Schedule' } },
            { path: 'users', component: AdminComponent, data: { title: 'User Management' } },
            { path: 'roles', component: AdminComponent, data: { title: 'Role Management' } },
            { path: 'settings', component: AdminComponent, data: { title: 'Settings' } },
            { path: 'test-roles', component: TestRolesComponent, data: { title: 'Test Roles' } },
            { path: 'profile', component: ProfileComponent, data: { title: 'My Profile' } }
        ]
    },
    
    // Legacy redirects
    { path: 'app', redirectTo: '/choose-role' },
    
    // Error routes
    { path: 'notfound', component: NotfoundComponent },
    { path: '**', redirectTo: '/notfound' }
]; 