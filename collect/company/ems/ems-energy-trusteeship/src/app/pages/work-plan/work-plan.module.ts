import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IconDefinition } from '@ant-design/icons-angular';
import { MoreOutline, PlusOutline, PlusCircleFill } from '@ant-design/icons-angular/icons';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { WorkPlanServiceModule } from './services/work-plan-service.module';
import { WorkPlanComponent } from './work-plan.component';
import { WorkPlanSearchComponent } from './work-plan-search/work-plan-search.component';
import { WorkPlanToolbarComponent } from './work-plan-toolbar/work-plan-toolbar.component';
import { WorkPlanTableComponent } from './work-plan-table/work-plan-table.component';
import { WorkPlanFormComponent } from './work-plan-form/work-plan-form.component';
import { WorkPlanFormBasicComponent } from './work-plan-form/work-plan-form-basic/work-plan-form-basic.component';
import { WorkPlanFormTimeComponent } from './work-plan-form/work-plan-form-time/work-plan-form-time.component';
import { WorkPlanFormDetailComponent } from './work-plan-form/work-plan-form-detail/work-plan-form-detail.component';

import { InputFilterModule } from 'src/app/common/directives/input-filter/input-filter.module';
import { InputValidatorModule } from 'src/app/common/directives/input-validator/input-validator.module';
import { PaginationModule } from 'src/app/common/components/pagination/pagination.module';
import { SearchBarModule } from 'src/app/common/components/search-bar/search-bar.module';

const routes: Routes = [
  { path: '', component: WorkPlanComponent },
  { path: 'form', component: WorkPlanFormComponent },
];

const icons: IconDefinition[] = [MoreOutline, PlusOutline, PlusCircleFill];

@NgModule({
  declarations: [
    WorkPlanComponent,
    WorkPlanSearchComponent,
    WorkPlanToolbarComponent,
    WorkPlanTableComponent,
    WorkPlanFormComponent,
    WorkPlanFormBasicComponent,
    WorkPlanFormTimeComponent,
    WorkPlanFormDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    WorkPlanServiceModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzIconModule.forChild(icons),
    NzInputModule,
    NzMessageModule,
    NzPopconfirmModule,
    NzPopoverModule,
    NzRadioModule,
    NzSelectModule,
    NzSpinModule,
    NzTimePickerModule,
    NzToolTipModule,
    InputFilterModule,
    InputValidatorModule,
    PaginationModule,
    SearchBarModule,
  ],
})
export class WorkPlanModule {}
