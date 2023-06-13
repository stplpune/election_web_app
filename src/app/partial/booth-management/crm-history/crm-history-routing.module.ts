import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrmHistoryComponent } from './crm-history.component';

const routes: Routes = [{ path: '', component: CrmHistoryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrmHistoryRoutingModule { }
