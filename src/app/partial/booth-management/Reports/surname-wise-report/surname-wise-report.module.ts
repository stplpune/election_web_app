import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SurnameWiseReportRoutingModule } from './surname-wise-report-routing.module';
import { SurnameWiseReportComponent } from './surname-wise-report.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';



@NgModule({
  declarations: [
    SurnameWiseReportComponent
  ],
  imports: [
    CommonModule,
    SurnameWiseReportRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule,
   
  ]
})
export class SurnameWiseReportModule { }
