import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignCandidateToConstituencyRoutingModule } from './assign-candidate-to-constituency-routing.module';
import { AssignCandidateToConstituencyComponent } from './assign-candidate-to-constituency.component';


@NgModule({
  declarations: [
    AssignCandidateToConstituencyComponent
  ],
  imports: [
    CommonModule,
    AssignCandidateToConstituencyRoutingModule
  ]
})
export class AssignCandidateToConstituencyModule { }
