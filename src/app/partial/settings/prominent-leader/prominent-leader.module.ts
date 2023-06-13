import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProminentLeaderRoutingModule } from './prominent-leader-routing.module';
import { ProminentLeaderComponent } from './prominent-leader.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';

@NgModule({
  declarations: [
    ProminentLeaderComponent
  ],
  imports: [
    CommonModule,
    ProminentLeaderRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule
  ]
})
export class ProminentLeaderModule { }
