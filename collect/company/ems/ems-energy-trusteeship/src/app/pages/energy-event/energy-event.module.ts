import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { NgxEchartsModule } from 'ngx-echarts';

import { IconDefinition } from '@ant-design/icons-angular';
import { PlusCircleFill } from '@ant-design/icons-angular/icons';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { EnergyEventServiceModule } from './service/energy-event.service.module';
import { EnergyEventComponent } from './energy-event.component';
import { EnergyEventFormComponent } from './energy-event-form/energy-event-form.component';
import { EnergyEventDetailComponent } from './energy-event-detail/energy-event-detail.component';
import { EnergyEventSearchComponent } from './energy-event-search/energy-event-search.component';
import { EnergyEventChartComponent } from './energy-event-chart/energy-event-chart.component';
import { EnergyEventCardsComponent } from './energy-event-cards/energy-event-cards.component';
import { EnergyEventTableComponent } from './energy-event-table/energy-event-table.component';

import { InputFilterModule } from 'src/app/common/directives/input-filter/input-filter.module';
import { SearchBarModule } from 'src/app/common/components/search-bar/search-bar.module';
import { PaginationModule } from 'src/app/common/components/pagination/pagination.module';
import { NumberSeparatorModule } from 'src/app/common/pipes/number-separator/number-separator.module';

const routes: Routes = [{ path: '', component: EnergyEventComponent }];

const icons: IconDefinition[] = [PlusCircleFill];

@NgModule({
  declarations: [
    EnergyEventComponent,
    EnergyEventFormComponent,
    EnergyEventDetailComponent,
    EnergyEventSearchComponent,
    EnergyEventChartComponent,
    EnergyEventCardsComponent,
    EnergyEventTableComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    NzDatePickerModule,
    NzIconModule.forChild(icons),
    NzImageModule,
    NzMessageModule,
    NzModalModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzSpinModule,
    NzToolTipModule,
    NzTreeSelectModule,
    EnergyEventServiceModule,
    InputFilterModule,
    SearchBarModule,
    PaginationModule,
    NumberSeparatorModule,
  ],
})
export class EnergyEventModule {}
