import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CandidateRegistrationComponent } from './candidate-registration.component';

const routes: Routes = [{ path: '', component: CandidateRegistrationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CandidateRegistrationRoutingModule { }
