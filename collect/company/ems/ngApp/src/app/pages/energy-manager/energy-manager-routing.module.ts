import { EmWeekSummaryComponent } from './em-week-summary/em-week-summary.component';
import { RouterModule, Routes } from '@angular/router';
import { EnergyManagerComponent } from './energy-manager.component';
import { EmsRecordMeasuresComponent } from './ems-record-measures/ems-record-measures.component';
import { NgModule } from '@angular/core';
import { EmTaskFeedbackComponent } from './em-task-feedback/em-task-feedback.component';

const routes: Routes = [
  {
    path: '',
    component: EnergyManagerComponent,
  },
  {
    path: 'feedback',
    component: EmTaskFeedbackComponent,
  },
  {
    path: 'recordManager',
    component: EmsRecordMeasuresComponent,
  },
  {
    path: 'weekSummary',
    component: EmWeekSummaryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnergyManagerRoutingModule {}
