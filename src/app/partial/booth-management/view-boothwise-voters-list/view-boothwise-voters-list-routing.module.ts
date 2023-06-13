import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewBoothwiseVotersListComponent } from './view-boothwise-voters-list.component';

const routes: Routes = [{ path: '', component: ViewBoothwiseVotersListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewBoothwiseVotersListRoutingModule { }
