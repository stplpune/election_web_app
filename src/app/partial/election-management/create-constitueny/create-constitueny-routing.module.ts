import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateConstituenyComponent } from './create-constitueny.component';

const routes: Routes = [{ path: '', component: CreateConstituenyComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateConstituenyRoutingModule { }
