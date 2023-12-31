import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteeDashboardRoutingModule } from './committee-dashboard-routing.module';
import { CommitteeDashboardComponent } from './committee-dashboard.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxPaginationModule } from 'ngx-pagination';
import { TooltipModule } from 'src/app/directives/tooltip.module';
import { NgApexchartsModule } from 'ng-apexcharts';


@NgModule({
  declarations: [
    CommitteeDashboardComponent
  ],
  imports: [
    CommonModule,
    CommitteeDashboardRoutingModule,
    NgxSelectModule,
    ReactiveFormsModule,
    FormsModule,
    OwlNativeDateTimeModule,
    OwlDateTimeModule,
    NgxPaginationModule,
    TooltipModule,
    NgApexchartsModule,
  ]
})
export class CommitteeDashboardModule { }
