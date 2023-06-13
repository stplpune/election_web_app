import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoothDashboardComponent } from './booth-dashboard.component';

const routes: Routes = [{ path: '', component: BoothDashboardComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoothDashboardRoutingModule { }
