import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MediaPerceptionReportRoutingModule } from './media-perception-report-routing.module';
import { MediaPerceptionReportComponent } from './media-perception-report.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { GalleryModule } from '@ngx-gallery/core';


@NgModule({
  declarations: [
    MediaPerceptionReportComponent
  ],
  imports: [
    CommonModule,
    MediaPerceptionReportRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule,
    LightboxModule,
    GalleryModule
  ]
})
export class MediaPerceptionReportModule { }
