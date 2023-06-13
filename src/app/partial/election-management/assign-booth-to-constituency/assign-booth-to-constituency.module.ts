import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignBoothToConstituencyRoutingModule } from './assign-booth-to-constituency-routing.module';
import { AssignBoothToConstituencyComponent } from './assign-booth-to-constituency.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [
    AssignBoothToConstituencyComponent
  ],
  imports: [
    CommonModule,
    AssignBoothToConstituencyRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatCheckboxModule,
    Ng2SearchPipeModule
  ]
})
export class AssignBoothToConstituencyModule { }
