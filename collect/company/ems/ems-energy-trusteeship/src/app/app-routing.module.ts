import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'eetMeasureLibrary',
    data: { title: '措施库' },
    loadChildren: () =>
      import('./pages/measure-library/measure-library.module').then(
        (m) => m.MeasureLibraryModule
      ),
  },
  {
    path: 'eetWorkPlan',
    data: { title: '工作计划' },
    loadChildren: () =>
      import('./pages/work-plan/work-plan.module').then(
        (m) => m.WorkPlanModule
      ),
  },
  {
    path: 'eetWorkRecord',
    data: { title: '工作记录', fix: 777 },
    loadChildren: () =>
      import('./pages/work-record/work-record.module').then(
        (m) => m.WorkRecordModule
      ),
  },

  // 空调群控
  {
    path: 'eetGroupControl',
    data: { title: '空调群控', fix: 777 },
    loadChildren: () =>
      import(
        './pages/air-conditioner-control/air-conditioner-control.module'
      ).then((m) => m.AirConditionerControlModule),
  },

  // 节能专家
  {
    path: 'eetFreezer',
    data: { title: '冷冻站' },
    loadChildren: () =>
      import('./pages/freezer/freezer.module').then((m) => m.FreezerModule),
  },
  {
    path: 'eetBoiler',
    data: { title: '锅炉' },
    loadChildren: () =>
      import('./pages/boiler/boiler.module').then((m) => m.BoilerModule),
  },

  // 能源事件
  {
    path: 'eetEnergyEvent',
    data: { title: '能源事件' },
    loadChildren: () =>
      import('./pages/energy-event/energy-event.module').then(
        (m) => m.EnergyEventModule
      ),
  },

  // 人工录入
  {
    path: 'eetManualEntry',
    data: { title: '人工录入' },
    loadChildren: () =>
      import('./pages/manual-entry/manual-entry.module').then(
        (m) => m.ManualEntryModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
