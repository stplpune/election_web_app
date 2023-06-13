import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateConstituenyRoutingModule } from './create-constitueny-routing.module';
import { CreateConstituenyComponent } from './create-constitueny.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { AgmCoreModule } from '@agm/core';
import { AgmDrawingManager, AgmDrawingModule } from '@agm/drawing';


@NgModule({
  declarations: [
    CreateConstituenyComponent
  ],
  imports: [
    CommonModule,
    CreateConstituenyRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ]
})
export class CreateConstituenyModule { }


