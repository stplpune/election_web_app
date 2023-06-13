import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CastMasterRoutingModule } from './cast-master-routing.module';
import { CastMasterComponent } from './cast-master.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    CastMasterComponent
  ],
  imports: [
    CommonModule,
    CastMasterRoutingModule,
    NgxSelectModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class CastMasterModule { }
