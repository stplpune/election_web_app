import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CandidateRegistrationRoutingModule } from './candidate-registration-routing.module';
import { CandidateRegistrationComponent } from './candidate-registration.component';


@NgModule({
  declarations: [
    CandidateRegistrationComponent
  ],
  imports: [
    CommonModule,
    CandidateRegistrationRoutingModule
  ]
})
export class CandidateRegistrationModule { }
