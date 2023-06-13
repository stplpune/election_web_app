import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForwardActivitiesRoutingModule } from './forward-activities-routing.module';
import { ForwardActivitiesComponent } from './forward-activities.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    ForwardActivitiesComponent
  ],
  imports: [
    CommonModule,
    ForwardActivitiesRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    OwlNativeDateTimeModule,
    OwlDateTimeModule,
    NgxPaginationModule
  ]
})
export class ForwardActivitiesModule { }
