import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { SearchBarComponent } from './search-bar.component';

import { InputFilterModule } from '../../directives/input-filter/input-filter.module';

@NgModule({
  declarations: [SearchBarComponent],
  exports: [SearchBarComponent],
  imports: [CommonModule, FormsModule, NzDatePickerModule, NzSelectModule, NzTreeSelectModule, InputFilterModule],
})
export class SearchBarModule {}
