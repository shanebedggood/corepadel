import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { PlayerLayoutComponent } from './app/layout/component/player-layout.component';
import { AdminLayoutComponent } from './app/layout/component/admin-layout.component';
import { RoleSwitcherComponent } from './app/pages/auth/role-switcher.component';


import { Dashboard } from './app/pages/player/dashboard/dashboard';
import { Landing } from './app/pages/landing/landing';
import { NotfoundComponent } from './app/pages/shared/notfound/notfound';
import { Rules } from './app/pages/player/rules/rules';
import { AuthGuard } from './app/guards/auth.guard';
import { AdminGuard } from './app/guards/admin.guard';
import { TestRolesComponent } from './app/pages/test-roles/test-roles.component';
import { TournamentsComponent } from './app/pages/admin/tournaments/components/tournaments/tournaments.component';
import { CreateTournamentComponent } from './app/pages/admin/tournaments/components/create-tournament/create-tournament.component';
import { EditTournamentComponent } from './app/pages/admin/tournaments/components/edit-tournament/edit-tournament.component';
import { AddTeamComponent } from './app/pages/admin/tournaments/components/add-team/add-team.component';
import { StandingsComponent } from './app/pages/admin/tournaments/components/standings/standings.component';
import { MatchScheduleComponent } from './app/pages/admin/tournaments/components/match-schedule/match-schedule.component';
import { AdminComponent } from './app/pages/admin/admin.component';
import { AdminSetupComponent } from './app/pages/admin/admin-setup.component';
import { ScheduleCourtsComponent } from './app/pages/admin/schedule-courts/schedule-courts.component';
import { CourtSchedulesComponent } from './app/pages/admin/court-schedules/court-schedules.component';
import { ProfileComponent } from './app/pages/shared/profile/profile.component';
import { ProfileUpdateComponent } from './app/pages/shared/profile/profile-update.component';
import { ClubsComponent } from './app/pages/player/clubs/clubs.component';
import { RunBookingComponent } from './app/pages/player/run-booking/run-booking.component';
import { CourtBookingComponent } from './app/pages/player/court-booking/court-booking.component';
import { ProfileCompletionGuard } from './app/guards/profile-completion.guard';
import { DevAuthPreserveGuard } from './app/guards/dev-auth-preserve.guard';
import authRoutes from './app/pages/auth/auth.routes';

export const appRoutes: Routes = [
    // Public routes (no authentication required)
    { path: '', component: Landing, canActivate: [DevAuthPreserveGuard] },
    { path: 'landing', component: Landing, canActivate: [DevAuthPreserveGuard] },
    { path: 'auth', children: authRoutes, canActivate: [DevAuthPreserveGuard] },
    
    // Protected routes (authentication required)
    { path: 'choose-role', component: RoleSwitcherComponent, canActivate: [AuthGuard] },
    {
        path: 'player',
        component: PlayerLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: Dashboard, canActivate: [ProfileCompletionGuard] },
            { path: 'standings/:tournamentId', component: StandingsComponent, data: { title: 'Tournament Standings' }, canActivate: [ProfileCompletionGuard] },
            { path: 'rules', component: Rules, canActivate: [ProfileCompletionGuard] },
            { path: 'tournaments', component: TournamentsComponent, canActivate: [ProfileCompletionGuard] },
            { path: 'clubs', component: ClubsComponent, canActivate: [ProfileCompletionGuard] },
            { path: 'run-booking', component: RunBookingComponent, canActivate: [ProfileCompletionGuard] },
            { path: 'court-booking', component: CourtBookingComponent, canActivate: [ProfileCompletionGuard] },
            { path: 'matches', component: Dashboard, canActivate: [ProfileCompletionGuard] }, // Placeholder for player matches
            { path: 'teams', component: Dashboard, canActivate: [ProfileCompletionGuard] }, // Placeholder for player teams
            { path: 'profile', component: ProfileComponent, canActivate: [ProfileCompletionGuard] },
            { path: 'profile/update', component: ProfileUpdateComponent },        ]
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
            { path: 'court-schedules', component: CourtSchedulesComponent, data: { title: 'Court Schedules' } },
            { path: 'schedule-courts', component: ScheduleCourtsComponent, data: { title: 'Create Court Schedule' } },
            { path: 'schedule-courts/:id', component: ScheduleCourtsComponent, data: { title: 'Edit Court Schedule' } },
            { path: 'users', component: AdminComponent, data: { title: 'User Management' } },
            { path: 'roles', component: AdminComponent, data: { title: 'Role Management' } },
            { path: 'settings', component: AdminComponent, data: { title: 'Settings' } },
            { path: 'test-roles', component: TestRolesComponent, data: { title: 'Test Roles' } },
            { path: 'profile', component: ProfileComponent, data: { title: 'My Profile' } }
        ]
    },
    // Error routes
    { path: 'notfound', component: NotfoundComponent },
    { path: '**', redirectTo: '/notfound' }
]; 