import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignElectionsToRegionalLeaderRoutingModule } from './assign-elections-to-regional-leader-routing.module';
import { AssignElectionsToRegionalLeaderComponent } from './assign-elections-to-regional-leader.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [
    AssignElectionsToRegionalLeaderComponent
  ],
  imports: [
    CommonModule,
    AssignElectionsToRegionalLeaderRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatCheckboxModule,
    Ng2SearchPipeModule
  ]
})
export class AssignElectionsToRegionalLeaderModule { }
