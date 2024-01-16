import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchHighLight',
})
export class SearchHighLightPipe implements PipeTransform {
  transform(value: any, searchValue: any): any {
    if (value.indexOf(searchValue) !== -1) {
      const val = value.replace(searchValue, '<span class="font-highlight">' + searchValue + '</span>');
      return val;
    } else {
      return value;
    }
  }
}
