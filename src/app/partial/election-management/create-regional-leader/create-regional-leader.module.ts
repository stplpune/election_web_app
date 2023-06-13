import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateRegionalLeaderRoutingModule } from './create-regional-leader-routing.module';
import { CreateRegionalLeaderComponent } from './create-regional-leader.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { Ng2SearchPipeModule } from 'ng2-search-filter';


@NgModule({
  declarations: [
    CreateRegionalLeaderComponent
  ],
  imports: [
    CommonModule,
    CreateRegionalLeaderRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatCheckboxModule,
    Ng2SearchPipeModule
  ]
})
export class CreateRegionalLeaderModule { }
