import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AuthorizationGuard } from './auth/authorization.guard';
import { NoAuthGuardService } from './auth/no-auth-guard.service';
import { PageNotFoundComponent } from './errors/page-not-found/page-not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { PartialComponent } from './partial/partial.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule), data: { title: 'Login' }, canActivate: [NoAuthGuardService] },
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthorizationGuard],
    component: PartialComponent, children: [
      //Ele manag
      { path: 'create-elections', loadChildren: () => import('./partial/election-management/create-elections/create-elections.module').then(m => m.CreateElectionsModule), data: { title: 'Create Election', allowedRoles: ['1'] } },
      { path: 'create-constituency', loadChildren: () => import('./partial/election-management/create-constitueny/create-constitueny.module').then(m => m.CreateConstituenyModule), data: { title: 'Create Constituency', allowedRoles: ['1'] } },
      { path: 'create-regional-leader', loadChildren: () => import('./partial/election-management/create-regional-leader/create-regional-leader.module').then(m => m.CreateRegionalLeaderModule), data: { title: 'Create Regional Leader', allowedRoles: ['1'] } },
      { path: 'assign-elections-to-regional-leader', loadChildren: () => import('./partial/election-management/assign-elections-to-regional-leader/assign-elections-to-regional-leader.module').then(m => m.AssignElectionsToRegionalLeaderModule), data: { title: 'Assign Elections to Regional Leader', allowedRoles: ['1'] } },
      { path: 'assign-booth-to-constituency', loadChildren: () => import('./partial/election-management/assign-booth-to-constituency/assign-booth-to-constituency.module').then(m => m.AssignBoothToConstituencyModule), data: { title: 'Assign Booths to Constituency', allowedRoles: ['1'] } },
      { path: 'election-dashboard', loadChildren: () => import('./partial/election-management/election-dashboard/election-dashboard.module').then(m => m.ElectionDashboardModule), data: { title: 'Election Dashboard', allowedRoles: ['1', '8'] } },
      { path: 'assign-booth-to-village', loadChildren: () => import('./partial/election-management/assign-booth-to-village/assign-booth-to-village.module').then(m => m.AssignBoothToVillageModule), data: { title: 'Assign Booths to Village', allowedRoles: ['1'] } },
      { path: 'client-setting', loadChildren: () => import('./partial/election-management/client-setting/client-setting.module').then(m => m.ClientSettingModule), data: { title: 'Leader Setting', allowedRoles: ['1'] } },
      { path: 'party-master', loadChildren: () => import('./partial/election-management/party-master/party-master.module').then(m => m.PartyMasterModule), data: { title: 'Party Master', allowedRoles: ['1', '2'] } },
      { path: 'caste-master', loadChildren: () => import('./partial/election-management/cast-master/cast-master.module').then(m => m.CastMasterModule), data: { title: 'Caste Master', allowedRoles: ['1', '2'] } },
      { path: 'white-labelling-company', loadChildren: () => import('./partial/election-management/white-labelling-company/white-labelling-company.module').then(m => m.WhiteLabellingCompanyModule), data: { title: 'White Labelling Company', allowedRoles: ['1'] } },

      //booth manag
      { path: 'agents-activity/:id', loadChildren: () => import('./partial/booth-management/agents-activity/agents-activity.module').then(m => m.AgentsActivityModule), data: { title: 'Agents Activity', allowedRoles: ['1', '2', '6'] } },
      { path: 'agents-activity', loadChildren: () => import('./partial/booth-management/agents-activity/agents-activity.module').then(m => m.AgentsActivityModule), data: { title: 'Agents Activity', allowedRoles: ['1', '2'] } },
      { path: 'assign-agents-to-booth', loadChildren: () => import('./partial/booth-management/assign-agents-to-booth/assign-agents-to-booth.module').then(m => m.AssignAgentsToBoothModule), data: { title: 'Assign Agents to Booths', allowedRoles: ['1', '2'] } },
      { path: 'assign-candidate-to-constituency', loadChildren: () => import('./partial/booth-management/assign-candidate-to-constituency/assign-candidate-to-constituency.module').then(m => m.AssignCandidateToConstituencyModule), data: { title: 'Assign Candidate To Constituency', allowedRoles: ['1', '2'] } },
      { path: 'booth-analytics', loadChildren: () => import('./partial/booth-management/booth-analytics/booth-analytics.module').then(m => m.BoothAnalyticsModule), data: { title: 'Booth Analytics', allowedRoles: ['1', '2'] } },
      { path: 'client-dashboard', loadChildren: () => import('./partial/booth-management/booth-dashboard/booth-dashboard.module').then(m => m.BoothDashboardModule), data: { title: 'Leader Dashboard', allowedRoles: ['1', '2', '7'] } },
      { path: 'candidate-registration', loadChildren: () => import('./partial/booth-management/candidate-registration/candidate-registration.module').then(m => m.CandidateRegistrationModule), data: { title: 'Candidate Registration', allowedRoles: ['1', '2'] } },
      { path: 'view-boothwise-voters-list', loadChildren: () => import('./partial/booth-management/view-boothwise-voters-list/view-boothwise-voters-list.module').then(m => m.ViewBoothwiseVotersListModule), data: { title: 'View Booth Wise Voters List', allowedRoles: ['1', '2'] } },
      { path: 'view-boothwise-voters-list/:id', loadChildren: () => import('./partial/booth-management/view-boothwise-voters-list/view-boothwise-voters-list.module').then(m => m.ViewBoothwiseVotersListModule), data: { title: 'View Booth Wise Voters List', allowedRoles: ['1', '2'] } },
      { path: 'add-supervisor', loadChildren: () => import('./partial/booth-management/add-supervisor/add-supervisor.module').then(m => m.AddSupervisorModule), data: { title: 'Add Supervisor', allowedRoles: ['1', '2'] } },
      { path: 'crm', loadChildren: () => import('./partial/booth-management/crm/crm.module').then(m => m.CrmModule), data: { title: 'CRM', allowedRoles: ['1', '2', '6'] } },
      { path: 'crm-history/:id', loadChildren: () => import('./partial/booth-management/crm-history/crm-history.module').then(m => m.CrmHistoryModule), data: { title: 'CRM History', allowedRoles: ['1', '2', '6'] } },
      { path: 'add-local-area', loadChildren: () => import('./partial/booth-management/add-local-area/add-local-area.module').then(m => m.AddLocalAreaModule), data: { title: 'Local Area', allowedRoles: ['1', '2', '6'] } },

      { path: 'voters-profile/:id', loadChildren: () => import('./partial/profile/voters-profile/voters-profile.module').then(m => m.VotersProfileModule), data: { title: 'Voters Profile', allowedRoles: ['1', '2', '6'] } },
      { path: 'restricted-mobile', loadChildren: () => import('./partial/settings/restricted-mobile/restricted-mobile.module').then(m => m.RestrictedMobileModule), data: { title: 'Restricted Mobile', allowedRoles: ['1', '2'] } },
      { path: 'my-profile', loadChildren: () => import('./my-profile/my-profile.module').then(m => m.MyProfileModule), data: { title: 'My Profile', allowedRoles: ['1', '2', '6','8'] } },
      { path: 'notifications', loadChildren: () => import('./partial/booth-management/notifications/notifications.module').then(m => m.NotificationsModule), data: { title: 'Notifications', allowedRoles: ['1', '2'] } },
      { path: 'forward-activities', loadChildren: () => import('./partial/booth-management/forward-activities/forward-activities.module').then(m => m.ForwardActivitiesModule), data: { title: 'Forward Activities', allowedRoles: ['1', '2'] } },
      { path: 'name-correction', loadChildren: () => import('./partial/booth-management/name-correction/name-correction.module').then(m => m.NameCorrectionModule), data: { title: 'Voter Name Correction', allowedRoles: ['1', '2'] } },
      { path: 'agent-setting', loadChildren: () => import('./partial/settings/agent-setting/agent-setting.module').then(m => m.AgentSettingModule), data: { title: 'Agent Setting', allowedRoles: ['1', '2'] } },
      { path: 'prominent-leader', loadChildren: () => import('./partial/settings/prominent-leader/prominent-leader.module').then(m => m.ProminentLeaderModule), data: { title: 'Prominent Leader', allowedRoles: ['1', '2'] } },
      { path: 'election-geofence-report', loadChildren: () => import('./partial/election-management/election-geofence-report/election-geofence-report.module').then(m => m.ElectionGeofenceReportModule), data: { title: 'Election Geofence Report', allowedRoles: ['1', '2'] } },
      { path: 'surname-wise-report', loadChildren: () => import('./partial/booth-management/Reports/surname-wise-report/surname-wise-report.module').then(m => m.SurnameWiseReportModule), data: { title: 'Surname Wise Report', allowedRoles: ['1', '2', '6'] } },
      { path: 'family-head-report', loadChildren: () => import('./partial/booth-management/Reports/family-head-report/family-head-report.module').then(m => m.FamilyHeadReportModule), data: { title: 'Family Head Report', allowedRoles: ['1', '2', '6'] } },
      { path: 'media-perception-report', loadChildren: () => import('./partial/booth-management/Reports/media-perception-report/media-perception-report.module').then(m => m.MediaPerceptionReportModule), data: { title: 'Media Perception Report', allowedRoles: ['1', '2'] } },
      { path: 'booth-committee', loadChildren: () => import('./partial/booth-management/booth-committee/booth-committee.module').then(m => m.BoothCommitteeModule), data: { title: 'Booth Committee', allowedRoles: ['1', '2', '7', '8'] } },
      { path: 'surname-caste-wise-report', loadChildren: () => import('./partial/booth-management/Reports/surname-caste-wise-report/surname-caste-wise-report.module').then(m => m.SurnameCasteWiseReportModule), data: { title: 'Surname Wise Caste Report', allowedRoles: ['1', '2'] } },
      { path: 'page-access-right', loadChildren: () => import('./partial/booth-management/page-access-right/page-access-right.module').then(m => m.PageAccessRightModule), data: { title: 'Page Access Rights', allowedRoles: ['1', '2'] } },
      { path: 'committee', loadChildren: () => import('./partial/organization-master/organization-master.module').then(m => m.OrganizationMasterModule), data: { title: 'Committee', allowedRoles: ['1', '2', '7', '8'] } },
      { path: 'committees-on-map', loadChildren: () => import('./partial/committees-on-map/committees-on-map.module').then(m => m.CommitteesOnMapModule), data: { title: 'Committees On Map', allowedRoles: ['1', '2', '7', '8'] } },
      { path: 'committee-dashboard', loadChildren: () => import('./partial/committee-dashboard/committee-dashboard.module').then(m => m.CommitteeDashboardModule), data: { title: 'Committee Dashboard', allowedRoles: ['1', '2', '7', '8'] } },
      { path: 'committee-dashboard1', loadChildren: () => import('./partial/committee-dashboard1/committee-dashboard1.module').then(m => m.CommitteeDashboard1Module), data: { title: 'Committee Dashboard', allowedRoles: ['1', '2', '7', '8'] } },
      
      { path: 'local-govt-body', loadChildren: () => import('./partial/booth-management/local-govt-body/local-govt-body.module').then(m => m.LocalGovtBodyModule), data: { title: 'Local Government Body' } },
      { path: 'assign-taluka-to-assembly', loadChildren: () => import('./partial/booth-management/assign-taluka-to-assembly/assign-taluka-to-assembly.module').then(m => m.AssignTalukaToAssemblyModule), data: { title: 'Assign Taluka to Assembly', allowedRoles: ['1', '2', '7', '8'] } },
    ]
  },
  { path: '500', component: ServerErrorComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
