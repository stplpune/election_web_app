import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocalGovtBodyRoutingModule } from './local-govt-body-routing.module';
import { LocalGovtBodyComponent } from './local-govt-body.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { NgxPaginationModule } from 'ngx-pagination';
import { TooltipModule } from 'src/app/directives/tooltip.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';


@NgModule({
  declarations: [
    LocalGovtBodyComponent
  ],
  imports: [
    CommonModule,
    LocalGovtBodyRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule,
    NgxPaginationModule,
    TooltipModule,
    Ng2SearchPipeModule
  ]
})
export class LocalGovtBodyModule { }
