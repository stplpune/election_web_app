import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientSettingRoutingModule } from './client-setting-routing.module';
import { ClientSettingComponent } from './client-setting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';


@NgModule({
  declarations: [
    ClientSettingComponent
  ],
  imports: [
    CommonModule,
    ClientSettingRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    NgxSelectModule
  ]
})
export class ClientSettingModule { }
