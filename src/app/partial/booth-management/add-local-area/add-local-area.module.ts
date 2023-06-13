import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddLocalAreaRoutingModule } from './add-local-area-routing.module';
import { AddLocalAreaComponent } from './add-local-area.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { CommonDirectivesModule } from 'src/app/directives/common.directives.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    AddLocalAreaComponent
  ],
  imports: [
    CommonModule,
    AddLocalAreaRoutingModule,
    NgxSelectModule,
    CommonDirectivesModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class AddLocalAreaModule { }
