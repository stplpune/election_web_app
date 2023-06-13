import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignAgentsToBoothRoutingModule } from './assign-agents-to-booth-routing.module';
import { AssignAgentsToBoothComponent } from './assign-agents-to-booth.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DashPipe } from 'src/app/pipes/dash.pipe';

@NgModule({
  declarations: [
    AssignAgentsToBoothComponent,
    DashPipe
  ],
  imports: [
    CommonModule,
    AssignAgentsToBoothRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatCheckboxModule,
    Ng2SearchPipeModule,
  ]
})
export class AssignAgentsToBoothModule { }
