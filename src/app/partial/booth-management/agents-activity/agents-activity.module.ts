import { NgModule } from '@angular/core';
import { CommonModule} from '@angular/common';
import { AgentsActivityRoutingModule } from './agents-activity-routing.module';
import { AgentsActivityComponent } from './agents-activity.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSelectModule } from 'ngx-select-ex';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';
import { AgmCoreModule } from '@agm/core';
import { DateTransformPipe } from 'src/app/pipes/date-transform.pipe';


@NgModule({
  declarations: [
    AgentsActivityComponent,
    DateTransformPipe,
  ],
  imports: [
    CommonModule,
    AgentsActivityRoutingModule,
    NgxSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatCheckboxModule,
    Ng2SearchPipeModule,
    OwlNativeDateTimeModule,
    OwlDateTimeModule,

    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
      language: 'en',
      libraries: ['geometry','places']
    }),
  ],
})
export class AgentsActivityModule { }
