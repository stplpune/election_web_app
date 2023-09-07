import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PastElectionResultComponent } from './past-election-result.component';

const routes: Routes = [{ path: '', component: PastElectionResultComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PastElectionResultRoutingModule { }
