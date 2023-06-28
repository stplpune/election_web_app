import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LocalGovtBodyComponent } from './local-govt-body.component';

const routes: Routes = [{ path: '', component: LocalGovtBodyComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocalGovtBodyRoutingModule { }
