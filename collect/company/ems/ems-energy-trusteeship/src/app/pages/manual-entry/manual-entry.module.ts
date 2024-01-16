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
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

import { InputFilterModule } from 'src/app/common/directives/input-filter/input-filter.module';
import { PaginationModule } from 'src/app/common/components/pagination/pagination.module';
import { ManualEntryComponent } from './manual-entry.component';
import { ManualEntrySearchComponent } from './manual-entry-search/manual-entry-search.component';
import { ManualEntryToolbarComponent } from './manual-entry-toolbar/manual-entry-toolbar.component';
import { ManualEntryTableComponent } from './manual-entry-table/manual-entry-table.component';

import { SearchHighLightModule } from 'src/app/common/pipes/search-high-light/search-high-light.module';
import { ManualEntryNoDataComponent } from './manual-entry-no-data/manual-entry-no-data.component';
import { ManualEntryQuickTimeComponent } from './manual-entry-quick-time/manual-entry-quick-time.component';
import { ManualEntryBatchImportComponent } from './manual-entry-batch-import/manual-entry-batch-import.component';
import { ManualEntryImportErrorListComponent } from './manual-entry-import-error-list/manual-entry-import-error-list.component';
import { ManualEntryFormComponent } from './manual-entry-form/manual-entry-form.component';
import { ManualEntryObjectComponent } from './manual-entry-object/manual-entry-object.component';

const routes: Routes = [{ path: '', component: ManualEntryComponent }];

@NgModule({
  declarations: [
    ManualEntryComponent,
    ManualEntrySearchComponent,
    ManualEntryToolbarComponent,
    ManualEntryTableComponent,
    ManualEntryNoDataComponent,
    ManualEntryQuickTimeComponent,
    ManualEntryBatchImportComponent,
    ManualEntryImportErrorListComponent,
    ManualEntryFormComponent,
    ManualEntryObjectComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    NzMessageModule,
    NzModalModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzSpinModule,
    NzToolTipModule,
    InputFilterModule,
    PaginationModule,
    NzInputModule,
    NzIconModule,
    NzTreeSelectModule,
    NzRadioModule,
    NzTreeModule,
    SearchHighLightModule,
    NzDatePickerModule,
    NzUploadModule,
    NzButtonModule,
    NzPopoverModule,
  ],
})
export class ManualEntryModule {}
