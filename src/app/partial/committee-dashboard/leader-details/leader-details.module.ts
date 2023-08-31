import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeaderDetailsRoutingModule } from './leader-details-routing.module';
import { LeaderDetailsComponent } from './leader-details.component';


@NgModule({
  declarations: [
    LeaderDetailsComponent
  ],
  imports: [
    CommonModule,
    LeaderDetailsRoutingModule
  ]
})
export class LeaderDetailsModule { }
