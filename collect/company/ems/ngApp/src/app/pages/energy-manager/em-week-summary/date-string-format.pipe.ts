import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateStringFormat'
})
export class DateStringFormatPipe implements PipeTransform {

  transform(value: string, args?: any): any {
    // console.log(value);
    if (value) {
      return value.replace(/-/g, '/');
    } else {
      return ''
    }
  }

}
