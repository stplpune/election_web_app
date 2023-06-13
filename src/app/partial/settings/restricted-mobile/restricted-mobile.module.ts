import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'
import { RestrictedMobileRoutingModule } from './restricted-mobile-routing.module';
import { RestrictedMobileComponent } from './restricted-mobile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';

@NgModule({
  declarations: [
    RestrictedMobileComponent
  ],
  imports: [
    CommonModule,
    RestrictedMobileRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxSelectModule
  ]
})
export class RestrictedMobileModule { }
