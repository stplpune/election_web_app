import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MediaPerceptionReportComponent } from './media-perception-report.component';

const routes: Routes = [{ path: '', component: MediaPerceptionReportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MediaPerceptionReportRoutingModule { }
