import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { WhiteLabellingCompanyRoutingModule } from './white-labelling-company-routing.module';
import { WhiteLabellingCompanyComponent } from './white-labelling-company.component';
import { CommonDirectivesModule } from 'src/app/directives/common.directives.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    WhiteLabellingCompanyComponent
  ],
  imports: [
    CommonModule,
    WhiteLabellingCompanyRoutingModule,
    CommonDirectivesModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class WhiteLabellingCompanyModule { }
