import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoothCommitteeRoutingModule } from './booth-committee-routing.module';
import { BoothCommitteeComponent } from './booth-committee.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [
    BoothCommitteeComponent
  ],
  imports: [
    CommonModule,
    BoothCommitteeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule,
    Ng2SearchPipeModule
  ]
})
export class BoothCommitteeModule { }
