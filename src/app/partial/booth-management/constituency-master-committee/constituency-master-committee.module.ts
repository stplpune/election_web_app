import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConstituencyMasterCommitteeRoutingModule } from './constituency-master-committee-routing.module';
import { ConstituencyMasterCommitteeComponent } from './constituency-master-committee.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { NgxPaginationModule } from 'ngx-pagination';
import { TooltipModule } from 'src/app/directives/tooltip.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';



@NgModule({
  declarations: [
    ConstituencyMasterCommitteeComponent
  ],
  imports: [
    CommonModule,
    ConstituencyMasterCommitteeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule,
    NgxPaginationModule,
    TooltipModule,
    Ng2SearchPipeModule
  ]
})
export class ConstituencyMasterCommitteeModule { }
