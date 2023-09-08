import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoothListComponent } from './booth-list.component';

const routes: Routes = [{ path: '', component: BoothListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoothListRoutingModule { }
