import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteeDashboardRoutingModule } from './committee-dashboard-routing.module';
import { CommitteeDashboardComponent } from './committee-dashboard.component';


@NgModule({
  declarations: [
    CommitteeDashboardComponent
  ],
  imports: [
    CommonModule,
    CommitteeDashboardRoutingModule
  ]
})
export class CommitteeDashboardModule { }
