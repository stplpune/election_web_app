import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoothListRoutingModule } from './booth-list-routing.module';
import { BoothListComponent } from './booth-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { Ng2SearchPipeModule } from 'ng2-search-filter';


@NgModule({
  declarations: [
    BoothListComponent
  ],
  imports: [
    CommonModule,
    BoothListRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule,
    Ng2SearchPipeModule
  ]
})
export class BoothListModule { }
