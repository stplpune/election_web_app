import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FamilyHeadReportComponent } from './family-head-report.component';

const routes: Routes = [{ path: '', component: FamilyHeadReportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FamilyHeadReportRoutingModule { }
