import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteesOnMapRoutingModule } from './committees-on-map-routing.module';
import { CommitteesOnMapComponent } from './committees-on-map.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TooltipModule } from 'src/app/directives/tooltip.module';

@NgModule({
  declarations: [
    CommitteesOnMapComponent
  ],
  imports: [
    CommonModule,
    CommitteesOnMapRoutingModule,
    NgxSelectModule,
    ReactiveFormsModule,
    FormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    TooltipModule
  ]
})
export class CommitteesOnMapModule { }
