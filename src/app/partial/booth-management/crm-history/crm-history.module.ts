import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CrmHistoryRoutingModule } from './crm-history-routing.module';
import { CrmHistoryComponent } from './crm-history.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';
import { AgmCoreModule } from '@agm/core';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { RatingModule } from 'ng-starrating';


@NgModule({
  declarations: [
    CrmHistoryComponent
  ],
  imports: [
    CommonModule,
    CrmHistoryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule,
    OwlNativeDateTimeModule,
    OwlDateTimeModule,
    RatingModule,
    FilterPipeModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
      language: 'en',
      libraries: ['places', 'geometry'],
    }),
  ]
})
export class CrmHistoryModule { }
