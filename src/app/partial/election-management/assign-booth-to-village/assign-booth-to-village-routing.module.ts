import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignBoothToVillageComponent } from './assign-booth-to-village.component';

const routes: Routes = [{ path: '', component: AssignBoothToVillageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignBoothToVillageRoutingModule { }
