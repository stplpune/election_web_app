import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CastMasterComponent } from './cast-master.component';

const routes: Routes = [{ path: '', component: CastMasterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CastMasterRoutingModule { }
