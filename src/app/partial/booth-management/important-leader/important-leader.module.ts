import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImportantLeaderRoutingModule } from './important-leader-routing.module';
import { ImportantLeaderComponent } from './important-leader.component';


@NgModule({
  declarations: [
    ImportantLeaderComponent
  ],
  imports: [
    CommonModule,
    ImportantLeaderRoutingModule
  ]
})
export class ImportantLeaderModule { }
