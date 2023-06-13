import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssignBoothToVillageRoutingModule } from './assign-booth-to-village-routing.module';
import { AssignBoothToVillageComponent } from './assign-booth-to-village.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [
    AssignBoothToVillageComponent,
  ],
  imports: [
    CommonModule,
    AssignBoothToVillageRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatCheckboxModule,
    Ng2SearchPipeModule,
  ]
})
export class AssignBoothToVillageModule { }
