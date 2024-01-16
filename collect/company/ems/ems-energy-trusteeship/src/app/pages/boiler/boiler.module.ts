import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Routes, RouterModule } from '@angular/router';

import { NgxEchartsModule } from 'ngx-echarts';

import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { BoilerServiceModule } from './service/boiler.service.module';
import { BoilerComponent } from './boiler.component';
import { BoilerSearchComponent } from './boiler-search/boiler-search.component';
import { BoilerSingleOverviewComponent } from './boiler-single/boiler-single-overview/boiler-single-overview.component';
import { BoilerSingleBenchmarkingComponent } from './boiler-single/boiler-single-benchmarking/boiler-single-benchmarking.component';
import { BoilerSingleParameterComponent } from './boiler-single/boiler-single-parameter/boiler-single-parameter.component';
import { BoilerSingleAnalysisComponent } from './boiler-single/boiler-single-analysis/boiler-single-analysis.component';
import { BoilerMultipleAnalysisComponent } from './boiler-multiple/boiler-multiple-analysis/boiler-multiple-analysis.component';
import { BoilerMultipleParameterComponent } from './boiler-multiple/boiler-multiple-parameter/boiler-multiple-parameter.component';

import { NumberSeparatorModule } from 'src/app/common/pipes/number-separator/number-separator.module';
import { PaginationModule } from 'src/app/common/components/pagination/pagination.module';
import { SearchBarModule } from 'src/app/common/components/search-bar/search-bar.module';

const routes: Routes = [{ path: '', component: BoilerComponent }];

@NgModule({
  declarations: [
    BoilerComponent,
    BoilerSearchComponent,
    BoilerSingleOverviewComponent,
    BoilerSingleBenchmarkingComponent,
    BoilerSingleParameterComponent,
    BoilerSingleAnalysisComponent,
    BoilerMultipleAnalysisComponent,
    BoilerMultipleParameterComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    RouterModule.forChild(routes),
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    NzMessageModule,
    NzSelectModule,
    NzSpinModule,
    NzToolTipModule,
    BoilerServiceModule,
    NumberSeparatorModule,
    PaginationModule,
    SearchBarModule,
  ],
})
export class BoilerModule {}
