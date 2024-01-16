import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InputFilterDirective_ExcludeNumber,
  InputFilterDirective_Special,
  InputFilterDirective_NoLine,
} from './input-filter.directive';

@NgModule({
  declarations: [
    InputFilterDirective_Special,
    InputFilterDirective_ExcludeNumber,
    InputFilterDirective_NoLine,
  ],
  exports: [
    InputFilterDirective_Special,
    InputFilterDirective_ExcludeNumber,
    InputFilterDirective_NoLine,
  ],
  imports: [CommonModule, FormsModule],
})
export class InputFilterModule {}
