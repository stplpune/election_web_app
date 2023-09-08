import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcToPcComponent } from './ac-to-pc.component';

const routes: Routes = [{ path: '', component: AcToPcComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcToPcRoutingModule { }
