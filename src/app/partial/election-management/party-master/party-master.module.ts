import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartyMasterComponent } from './party-master.component';
import { OnlyAlphabetsDirective } from 'src/app/directives/only-alphabets.directive';
import { NgxSelectModule } from 'ngx-select-ex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { PartyMasterRoutingModule } from './party-master-routing.module';
import { CommonDirectivesModule } from 'src/app/directives/common.directives.module';
@NgModule({
  declarations: [
    PartyMasterComponent,
  ],
  imports: [
    CommonModule,
    NgxSelectModule,
    PartyMasterRoutingModule,
    CommonDirectivesModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class PartyMasterModule { }
