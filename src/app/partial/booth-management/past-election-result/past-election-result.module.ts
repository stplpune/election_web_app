import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PastElectionResultRoutingModule } from './past-election-result-routing.module';
import { PastElectionResultComponent } from './past-election-result.component';


@NgModule({
  declarations: [
    PastElectionResultComponent
  ],
  imports: [
    CommonModule,
    PastElectionResultRoutingModule
  ]
})
export class PastElectionResultModule { }
