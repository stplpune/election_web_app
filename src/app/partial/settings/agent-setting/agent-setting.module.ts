import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentSettingRoutingModule } from './agent-setting-routing.module';
import { AgentSettingComponent } from './agent-setting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';

@NgModule({
  declarations: [
    AgentSettingComponent
  ],
  imports: [
    CommonModule,
    AgentSettingRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    NgxSelectModule
  ]
})
export class AgentSettingModule { }
