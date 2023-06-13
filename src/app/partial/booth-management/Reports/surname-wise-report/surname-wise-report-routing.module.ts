import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurnameWiseReportComponent } from './surname-wise-report.component';

const routes: Routes = [{ path: '', component: SurnameWiseReportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SurnameWiseReportRoutingModule { }
