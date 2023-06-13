import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignAgentsToBoothComponent } from './assign-agents-to-booth.component';

const routes: Routes = [{ path: '', component: AssignAgentsToBoothComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignAgentsToBoothRoutingModule { }
