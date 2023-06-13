import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignElectionsToRegionalLeaderComponent } from './assign-elections-to-regional-leader.component';

const routes: Routes = [{ path: '', component: AssignElectionsToRegionalLeaderComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignElectionsToRegionalLeaderRoutingModule { }
