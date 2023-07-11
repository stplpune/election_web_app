import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignTalukaToAssemblyComponent } from './assign-taluka-to-assembly.component';

const routes: Routes = [
  {path:'',component:AssignTalukaToAssemblyComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignTalukaToAssemblyRoutingModule { }
