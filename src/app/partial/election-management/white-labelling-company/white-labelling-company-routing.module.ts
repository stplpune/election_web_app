import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WhiteLabellingCompanyComponent } from './white-labelling-company.component';

const routes: Routes = [{ path: '', component: WhiteLabellingCompanyComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WhiteLabellingCompanyRoutingModule { }
