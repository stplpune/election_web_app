import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NameCorrectionComponent } from './name-correction.component';

const routes: Routes = [{ path: '', component: NameCorrectionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NameCorrectionRoutingModule { }
