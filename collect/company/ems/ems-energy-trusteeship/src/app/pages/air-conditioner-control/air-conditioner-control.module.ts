import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { NgxEchartsModule } from 'ngx-echarts';

import { IconDefinition } from '@ant-design/icons-angular';
import { CaretDownOutline, CaretRightOutline, RightCircleFill, CloseOutline } from '@ant-design/icons-angular/icons';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { AirConditionerControlServiceModule } from './service/air-conditioner-control.service.module';
import { AirConditionerControlComponent } from './air-conditioner-control.component';
import { AirConditionerControlCardsComponent } from './air-conditioner-control-cards/air-conditioner-control-cards.component';
import { AirConditionerControlCardsChartComponent } from './air-conditioner-control-cards/air-conditioner-control-cards-chart/air-conditioner-control-cards-chart.component';
import { AirConditionerControlOverviewComponent } from './air-conditioner-control-overview/air-conditioner-control-overview.component';
import { AirConditionerControlPredictComponent } from './air-conditioner-control-predict/air-conditioner-control-predict.component';
import { AirConditionerControlStatisticsComponent } from './air-conditioner-control-statistics/air-conditioner-control-statistics.component';
import { AirConditionerControlListComponent } from './air-conditioner-control-list/air-conditioner-control-list.component';
import { AirConditionerControlListMoreComponent } from './air-conditioner-control-list/air-conditioner-control-list-more/air-conditioner-control-list-more.component';
import { AirConditionerControlListStrategyComponent } from './air-conditioner-control-list/air-conditioner-control-list-strategy/air-conditioner-control-list-strategy.component';

import { NumberSeparatorModule } from 'src/app/common/pipes/number-separator/number-separator.module';

const routes: Routes = [{ path: '', component: AirConditionerControlComponent }];

const icons: IconDefinition[] = [CaretDownOutline, CaretRightOutline, RightCircleFill, CloseOutline];

@NgModule({
  declarations: [
    AirConditionerControlComponent,
    AirConditionerControlCardsComponent,
    AirConditionerControlCardsChartComponent,
    AirConditionerControlOverviewComponent,
    AirConditionerControlPredictComponent,
    AirConditionerControlStatisticsComponent,
    AirConditionerControlListComponent,
    AirConditionerControlListMoreComponent,
    AirConditionerControlListStrategyComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    NzCarouselModule,
    NzDatePickerModule,
    NzIconModule.forChild(icons),
    NzMessageModule,
    NzModalModule,
    NzSpinModule,
    NzTimelineModule,
    NzToolTipModule,
    AirConditionerControlServiceModule,
    NumberSeparatorModule,
  ],
})
export class AirConditionerControlModule {}
