import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AcToPcRoutingModule } from './ac-to-pc-routing.module';
import { AcToPcComponent } from './ac-to-pc.component';


@NgModule({
  declarations: [
    AcToPcComponent
  ],
  imports: [
    CommonModule,
    AcToPcRoutingModule
  ]
})
export class AcToPcModule { }
