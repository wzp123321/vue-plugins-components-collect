import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { MeasureLibraryServiceModule } from './services/measure-library.service.module';
import { MeasureLibraryComponent } from './measure-library.component';
import { MeasureLibrarySearchComponent } from './measure-library-search/measure-library-search.component';
import { MeasureLibraryToolbarComponent } from './measure-library-toolbar/measure-library-toolbar.component';
import { MeasureLibraryTableComponent } from './measure-library-table/measure-library-table.component';
import { MeasureLibraryFormComponent } from './measure-library-form/measure-library-form.component';

import { InputFilterModule } from 'src/app/common/directives/input-filter/input-filter.module';
import { ExceptionTableModule } from 'src/app/common/components/exception-table/exception-table.module';
import { PaginationModule } from 'src/app/common/components/pagination/pagination.module';
import { SearchBarModule } from 'src/app/common/components/search-bar/search-bar.module';

const routes: Routes = [{ path: '', component: MeasureLibraryComponent }];

@NgModule({
  declarations: [
    MeasureLibraryComponent,
    MeasureLibrarySearchComponent,
    MeasureLibraryToolbarComponent,
    MeasureLibraryTableComponent,
    MeasureLibraryFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MeasureLibraryServiceModule,
    NzMessageModule,
    NzModalModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzSpinModule,
    NzToolTipModule,
    InputFilterModule,
    ExceptionTableModule,
    PaginationModule,
    SearchBarModule,
  ],
})
export class MeasureLibraryModule {}
