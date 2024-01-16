import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputValidatorDirective_Number } from './input-validator.directive';

@NgModule({
  declarations: [InputValidatorDirective_Number],
  exports: [InputValidatorDirective_Number],
  imports: [CommonModule, FormsModule],
})
export class InputValidatorModule {}
