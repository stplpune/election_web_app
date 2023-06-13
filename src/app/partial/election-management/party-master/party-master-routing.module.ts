import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartyMasterComponent } from './party-master.component';

const routes: Routes = [{ path: '', component: PartyMasterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartyMasterRoutingModule { }
