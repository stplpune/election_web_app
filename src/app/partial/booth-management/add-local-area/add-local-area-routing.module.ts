import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddLocalAreaComponent } from './add-local-area.component';

const routes: Routes = [{ path: '', component: AddLocalAreaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddLocalAreaRoutingModule { }
