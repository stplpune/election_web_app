import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteeDashboard1RoutingModule } from './committee-dashboard1-routing.module';
import { CommitteeDashboard1Component } from './committee-dashboard1.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxPaginationModule } from 'ngx-pagination';
import { TooltipModule } from 'src/app/directives/tooltip.module';
import { NgApexchartsModule } from 'ng-apexcharts';


@NgModule({
  declarations: [
    CommitteeDashboard1Component
  ],
  imports: [
    CommonModule,
    CommitteeDashboard1RoutingModule,
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
export class CommitteeDashboard1Module { }
