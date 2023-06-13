import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddSupervisorRoutingModule } from './add-supervisor-routing.module';
import { AddSupervisorComponent } from './add-supervisor.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [
    AddSupervisorComponent
  ],
  imports: [
    CommonModule,
    AddSupervisorRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule,
    Ng2SearchPipeModule
  ]
})
export class AddSupervisorModule { }
