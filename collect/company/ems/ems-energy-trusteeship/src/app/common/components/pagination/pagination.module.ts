import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { PaginationComponent } from './pagination.component';
import { PaginationPipe } from './pagination.pipe';

import { InputFilterModule } from '../../directives/input-filter/input-filter.module';
import { InputValidatorModule } from '../../directives/input-validator/input-validator.module';

@NgModule({
  declarations: [PaginationComponent, PaginationPipe],
  exports: [PaginationComponent, PaginationPipe],
  imports: [CommonModule, FormsModule, NzIconModule, NzSelectModule, InputFilterModule, InputValidatorModule],
})
export class PaginationModule {}
