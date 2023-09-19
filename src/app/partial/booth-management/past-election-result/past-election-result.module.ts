import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PastElectionResultRoutingModule } from './past-election-result-routing.module';
import { PastElectionResultComponent } from './past-election-result.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    PastElectionResultComponent
  ],
  imports: [
    CommonModule,
    PastElectionResultRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSelectModule,
    Ng2SearchPipeModule,
    NgxPaginationModule
  ]
})
export class PastElectionResultModule { }
