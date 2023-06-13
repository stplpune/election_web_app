import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ElectionDashboardRoutingModule } from './election-dashboard-routing.module';
import { ElectionDashboardComponent } from './election-dashboard.component';


@NgModule({
  declarations: [
    ElectionDashboardComponent
  ],
  imports: [
    CommonModule,
    ElectionDashboardRoutingModule
  ]
})
export class ElectionDashboardModule { }
