import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ElectionGeofenceReportComponent } from './election-geofence-report.component';

const routes: Routes = [{ path: '', component: ElectionGeofenceReportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ElectionGeofenceReportRoutingModule { }
