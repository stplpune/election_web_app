import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommitteesOnMapComponent } from './committees-on-map.component';

const routes: Routes = [{ path: '', component: CommitteesOnMapComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommitteesOnMapRoutingModule { }
