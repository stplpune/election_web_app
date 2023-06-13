import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoothDashboardRoutingModule } from './booth-dashboard-routing.module';
import { BoothDashboardComponent } from './booth-dashboard.component';


@NgModule({
  declarations: [
    BoothDashboardComponent
  ],
  imports: [
    CommonModule,
    BoothDashboardRoutingModule
  ]
})
export class BoothDashboardModule { }
