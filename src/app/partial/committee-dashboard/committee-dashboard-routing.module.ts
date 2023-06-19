import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommitteeDashboardComponent } from './committee-dashboard.component';

const routes: Routes = [{ path: '', component: CommitteeDashboardComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommitteeDashboardRoutingModule { }
