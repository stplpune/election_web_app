import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProminentLeaderComponent } from './prominent-leader.component';

const routes: Routes = [{ path: '', component: ProminentLeaderComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProminentLeaderRoutingModule { }
