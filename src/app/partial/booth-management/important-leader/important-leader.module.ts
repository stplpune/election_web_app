import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingModule } from 'ng-starrating';
import { ImportantLeaderRoutingModule } from './important-leader-routing.module';
import { ImportantLeaderComponent } from './important-leader.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { TooltipModule } from 'src/app/directives/tooltip.module';


@NgModule({
  declarations: [
    ImportantLeaderComponent
  ],
  imports: [
    CommonModule,
    ImportantLeaderRoutingModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule,
    NgxPaginationModule,
    TooltipModule,
    Ng2SearchPipeModule,
    RatingModule
  ]
})
export class ImportantLeaderModule { }
