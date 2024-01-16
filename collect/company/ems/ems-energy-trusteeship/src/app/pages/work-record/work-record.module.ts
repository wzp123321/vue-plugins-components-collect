import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { WorkRecordServiceModule } from './services/work-record-service.module';
import { WorkRecordComponent } from './work-record.component';
import { WorkRecordCalendarComponent } from './work-record-calendar/work-record-calendar.component';
import { WorkRecordListComponent } from './work-record-list/work-record-list.component';

const routes: Routes = [{ path: '', component: WorkRecordComponent }];

@NgModule({
  declarations: [WorkRecordComponent, WorkRecordCalendarComponent, WorkRecordListComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    WorkRecordServiceModule,
    NzIconModule,
    NzImageModule,
    NzMessageModule,
    NzSelectModule,
    NzSpinModule,
  ],
})
export class WorkRecordModule {}
