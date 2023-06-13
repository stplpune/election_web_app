import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoothCommitteeComponent } from './booth-committee.component';

const routes: Routes = [{ path: '', component: BoothCommitteeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoothCommitteeRoutingModule { }
