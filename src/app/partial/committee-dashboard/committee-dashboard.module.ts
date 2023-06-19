import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteeDashboardRoutingModule } from './committee-dashboard-routing.module';
import { CommitteeDashboardComponent } from './committee-dashboard.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxPaginationModule } from 'ngx-pagination';


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
    NgxPaginationModule
  ]
})
export class CommitteeDashboardModule { }
