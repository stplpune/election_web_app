import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VotersProfileComponent } from './voters-profile.component';

const routes: Routes = [{ path: '', component: VotersProfileComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VotersProfileRoutingModule { }
