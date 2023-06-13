import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NameCorrectionRoutingModule } from './name-correction-routing.module';
import { NameCorrectionComponent } from './name-correction.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';

@NgModule({
  declarations: [
    NameCorrectionComponent
  ],
  imports: [
    CommonModule,
    NameCorrectionRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,

  ]
})
export class NameCorrectionModule { }
