import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberSeparator',
})
export class NumberSeparatorPipe implements PipeTransform {
  transform(value: string | number, digits: number = 3, flag: string = ','): string {
    if (value == null) {
      return null;
    }

    const reg = new RegExp(String.raw`\B(?<!\.\d*)(?=(\d{${digits}})+(?!\d))`, 'g');
    return value.toString().replace(reg, flag);
  }
}
