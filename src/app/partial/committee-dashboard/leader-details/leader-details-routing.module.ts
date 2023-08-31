import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaderDetailsComponent } from './leader-details.component';

const routes: Routes = [{ path: '', component: LeaderDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaderDetailsRoutingModule { }
