import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurnameCasteWiseReportComponent } from './surname-caste-wise-report.component';

const routes: Routes = [{ path: '', component: SurnameCasteWiseReportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SurnameCasteWiseReportRoutingModule { }
