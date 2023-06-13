import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurnameCasteWiseReportRoutingModule } from './surname-caste-wise-report-routing.module';
import { SurnameCasteWiseReportComponent } from './surname-caste-wise-report.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';

@NgModule({
  declarations: [
    SurnameCasteWiseReportComponent
  ],
  imports: [
    CommonModule,
    SurnameCasteWiseReportRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule,
  ]
})
export class SurnameCasteWiseReportModule { }
