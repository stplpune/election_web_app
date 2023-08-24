import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommitteeDashboard1Component } from './committee-dashboard1.component';

const routes: Routes = [{ path: '', component: CommitteeDashboard1Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommitteeDashboard1RoutingModule { }
