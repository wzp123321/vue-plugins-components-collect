import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
  //{ path: '', redirectTo: 'energyManager', pathMatch: 'full' }, // !默认路由重定向，仅限开发时使用，发布时请删除
  {
    path: 'energyManager',
    loadChildren: () => import('./pages/energy-manager/energy-manager.module').then(m => m.EnergyManagerModule),
  },
  {
    path: 'energyEvents',
    loadChildren: () => import('./pages/energy-events/energy-events.module').then(m => m.EnergyEventsModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
