import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageAccessRightRoutingModule } from './page-access-right-routing.module';
import { PageAccessRightComponent } from './page-access-right.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PageAccessRightComponent
  ],
  imports: [
    CommonModule,
    PageAccessRightRoutingModule,
    ReactiveFormsModule
  ]
})
export class PageAccessRightModule { }
