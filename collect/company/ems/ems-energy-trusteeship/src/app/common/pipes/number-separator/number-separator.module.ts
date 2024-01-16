import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumberSeparatorPipe } from './number-separator.pipe';

@NgModule({
  declarations: [NumberSeparatorPipe],
  exports: [NumberSeparatorPipe],
  imports: [CommonModule],
})
export class NumberSeparatorModule {}
