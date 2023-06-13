import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageAccessRightComponent } from './page-access-right.component';

const routes: Routes = [{ path: '', component: PageAccessRightComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageAccessRightRoutingModule { }
