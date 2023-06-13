import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForwardActivitiesComponent } from './forward-activities.component';

const routes: Routes = [{ path: '', component: ForwardActivitiesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForwardActivitiesRoutingModule { }
