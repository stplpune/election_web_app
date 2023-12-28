import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImportantLeaderComponent } from './important-leader.component';

const routes: Routes = [{ path: '', component: ImportantLeaderComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportantLeaderRoutingModule { }
