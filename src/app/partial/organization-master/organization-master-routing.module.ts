import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationMasterComponent } from './organization-master.component';

const routes: Routes = [{ path: '', component: OrganizationMasterComponent },
{ path: 'details', loadChildren: () => import('./organization-details/organization-details.module').then(m => m.OrganizationDetailsModule), data: { title: 'Committee Details'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationMasterRoutingModule { }
