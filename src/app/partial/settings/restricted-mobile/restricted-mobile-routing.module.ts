import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RestrictedMobileComponent } from './restricted-mobile.component';

const routes: Routes = [{ path: '', component: RestrictedMobileComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestrictedMobileRoutingModule { }
