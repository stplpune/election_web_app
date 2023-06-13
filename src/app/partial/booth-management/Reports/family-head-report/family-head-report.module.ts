import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyHeadReportRoutingModule } from './family-head-report-routing.module';
import { FamilyHeadReportComponent } from './family-head-report.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';


@NgModule({
  declarations: [
    FamilyHeadReportComponent
  ],
  imports: [
    CommonModule,
    FamilyHeadReportRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule,
  ]
})
export class FamilyHeadReportModule { }
