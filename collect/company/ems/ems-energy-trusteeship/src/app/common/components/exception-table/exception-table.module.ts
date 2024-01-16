import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ExceptionTableComponent } from './exception-table.component';

@NgModule({
  declarations: [ExceptionTableComponent],
  exports: [ExceptionTableComponent],
  imports: [CommonModule, ScrollingModule, NzToolTipModule],
})
export class ExceptionTableModule {}
