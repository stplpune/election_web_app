import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignBoothToConstituencyComponent } from './assign-booth-to-constituency.component';

const routes: Routes = [{ path: '', component: AssignBoothToConstituencyComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignBoothToConstituencyRoutingModule { }
