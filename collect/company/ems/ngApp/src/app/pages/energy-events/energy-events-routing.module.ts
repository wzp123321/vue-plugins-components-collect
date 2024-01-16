 import { RouterModule, Routes } from '@angular/router';
import { EnergyEventsComponent } from './energy-events.component'; 
import { NgModule } from '@angular/core'; 
import { EmsNewEventsComponent } from './ems-new-events/ems-new-events.component';
import { EmsEventsModalComponent } from './ems-new-events/ems-events-modal/ems-events-modal.component';

const routes: Routes = [
  {
    path: '',
    component: EnergyEventsComponent,
  },
  {
    path: 'newEvents',
    component: EmsNewEventsComponent,
  },
  {
    path: 'newEventsModal',
    component: EmsEventsModalComponent,
  } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnergyEventsRoutingModule {}
