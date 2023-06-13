import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoothAnalyticsComponent } from './booth-analytics.component';

const routes: Routes = [{ path: '', component: BoothAnalyticsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoothAnalyticsRoutingModule { }
