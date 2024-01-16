import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Add0ToHeadPipe } from './number/add-0-to-head.pipe';
import { FilterNamePipe } from './filter/filter-name.pipe';

@NgModule({
  declarations: [Add0ToHeadPipe, FilterNamePipe],
  imports: [CommonModule],
  exports: [Add0ToHeadPipe, FilterNamePipe],
})
export class PipesModule {}
