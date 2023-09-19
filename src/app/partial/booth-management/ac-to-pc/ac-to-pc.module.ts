import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AcToPcRoutingModule } from './ac-to-pc-routing.module';
import { AcToPcComponent } from './ac-to-pc.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [
    AcToPcComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AcToPcRoutingModule,
    NgxPaginationModule,
    NgxSelectModule,
    Ng2SearchPipeModule,
    MatCardModule
  ]
})
export class AcToPcModule { }
