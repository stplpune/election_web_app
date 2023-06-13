import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignCandidateToConstituencyComponent } from './assign-candidate-to-constituency.component';

const routes: Routes = [{ path: '', component: AssignCandidateToConstituencyComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignCandidateToConstituencyRoutingModule { }
