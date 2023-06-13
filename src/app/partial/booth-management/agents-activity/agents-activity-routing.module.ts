import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentsActivityComponent } from './agents-activity.component';

const routes: Routes = [{ path: '', component: AgentsActivityComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentsActivityRoutingModule { }
