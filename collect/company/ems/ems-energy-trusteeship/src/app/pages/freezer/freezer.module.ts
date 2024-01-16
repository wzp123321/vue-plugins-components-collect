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

import { FreezerServiceModule } from './service/freezer.service.module';
import { FreezerComponent } from './freezer.component';
import { FreezerSearchComponent } from './freezer-search/freezer-search.component';
import { FreezerSingleOverviewComponent } from './freezer-single/freezer-single-overview/freezer-single-overview.component';
import { FreezerSingleBenchmarkingComponent } from './freezer-single/freezer-single-benchmarking/freezer-single-benchmarking.component';
import { FreezerSingleParameterComponent } from './freezer-single/freezer-single-parameter/freezer-single-parameter.component';
import { FreezerSingleAnalysisComponent } from './freezer-single/freezer-single-analysis/freezer-single-analysis.component';
import { FreezerMultipleAnalysisComponent } from './freezer-multiple/freezer-multiple-analysis/freezer-multiple-analysis.component';
import { FreezerMultipleParameterComponent } from './freezer-multiple/freezer-multiple-parameter/freezer-multiple-parameter.component';

import { NumberSeparatorModule } from 'src/app/common/pipes/number-separator/number-separator.module';
import { PaginationModule } from 'src/app/common/components/pagination/pagination.module';
import { SearchBarModule } from 'src/app/common/components/search-bar/search-bar.module';

const routes: Routes = [{ path: '', component: FreezerComponent }];

@NgModule({
  declarations: [
    FreezerComponent,
    FreezerSearchComponent,
    FreezerSingleOverviewComponent,
    FreezerSingleBenchmarkingComponent,
    FreezerSingleParameterComponent,
    FreezerSingleAnalysisComponent,
    FreezerMultipleAnalysisComponent,
    FreezerMultipleParameterComponent,
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
    FreezerServiceModule,
    NumberSeparatorModule,
    PaginationModule,
    SearchBarModule,
  ],
})
export class FreezerModule {}
