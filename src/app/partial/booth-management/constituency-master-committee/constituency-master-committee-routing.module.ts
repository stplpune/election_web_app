import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConstituencyMasterCommitteeComponent } from './constituency-master-committee.component';

const routes: Routes = [{ path: '', component: ConstituencyMasterCommitteeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConstituencyMasterCommitteeRoutingModule { }
