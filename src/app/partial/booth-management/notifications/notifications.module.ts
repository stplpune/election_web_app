import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    NotificationsComponent
  ],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    OwlNativeDateTimeModule,
    OwlDateTimeModule,
    NgxPaginationModule
  ]
})
export class NotificationsModule { }
