import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ElectionDashboardComponent } from './election-dashboard.component';

const routes: Routes = [{ path: '', component: ElectionDashboardComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ElectionDashboardRoutingModule { }
