import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocalGovtBodyRoutingModule } from './local-govt-body-routing.module';
import { LocalGovtBodyComponent } from './local-govt-body.component';


@NgModule({
  declarations: [
    LocalGovtBodyComponent
  ],
  imports: [
    CommonModule,
    LocalGovtBodyRoutingModule
  ]
})
export class LocalGovtBodyModule { }
