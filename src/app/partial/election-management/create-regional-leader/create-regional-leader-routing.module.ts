import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateRegionalLeaderComponent } from './create-regional-leader.component';

const routes: Routes = [{ path: '', component: CreateRegionalLeaderComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateRegionalLeaderRoutingModule { }
