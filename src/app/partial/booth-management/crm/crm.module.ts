import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmRoutingModule } from './crm-routing.module';
import { CrmComponent } from './crm.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';


@NgModule({
  declarations: [
    CrmComponent
  ],
  imports: [
    CommonModule,
    CrmRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    OwlNativeDateTimeModule,
    OwlDateTimeModule
  ]
})
export class CrmModule { }
