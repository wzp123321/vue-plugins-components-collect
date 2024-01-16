import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonHeadComponent } from './common-head/common-head.component';

@NgModule({
  declarations: [CommonHeadComponent],
  imports: [CommonModule],
  exports: [CommonHeadComponent],
})
export class ComponentsModule {}
