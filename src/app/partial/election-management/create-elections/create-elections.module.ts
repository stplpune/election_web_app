import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateElectionsRoutingModule } from './create-elections-routing.module';
import { CreateElectionsComponent } from './create-elections.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';



@NgModule({
  declarations: [
    CreateElectionsComponent
  ],
  imports: [
    CommonModule,
    CreateElectionsRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class CreateElectionsModule { }
