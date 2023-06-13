import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateElectionsComponent } from './create-elections.component';

const routes: Routes = [{ path: '', component: CreateElectionsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateElectionsRoutingModule { }
