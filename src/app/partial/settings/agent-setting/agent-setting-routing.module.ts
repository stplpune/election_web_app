import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentSettingComponent } from './agent-setting.component';

const routes: Routes = [{ path: '', component: AgentSettingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentSettingRoutingModule { }
