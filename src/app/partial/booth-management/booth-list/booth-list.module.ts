import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoothListRoutingModule } from './booth-list-routing.module';
import { BoothListComponent } from './booth-list.component';


@NgModule({
  declarations: [
    BoothListComponent
  ],
  imports: [
    CommonModule,
    BoothListRoutingModule
  ]
})
export class BoothListModule { }
