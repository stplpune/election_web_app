import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignTalukaToAssemblyRoutingModule } from './assign-taluka-to-assembly-routing.module';
import { AssignTalukaToAssemblyComponent } from './assign-taluka-to-assembly.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';


@NgModule({
  declarations: [
    AssignTalukaToAssemblyComponent
  ],
  imports: [
    CommonModule,
    AssignTalukaToAssemblyRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule,
    NgxPaginationModule,
    Ng2SearchPipeModule
  ]
})
export class AssignTalukaToAssemblyModule { }
