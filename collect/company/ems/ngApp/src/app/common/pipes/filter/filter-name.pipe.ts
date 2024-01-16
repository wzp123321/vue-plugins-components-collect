import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterName',
  pure: false
})
export class FilterNamePipe implements PipeTransform {

  transform(items: any[], filter: any): any { 
    if (!items || !filter) {
      return items;
  }
  // filter items array, items which match and return true will be
  // kept, false will be filtered out
  return items.filter(item => item.deviceName.indexOf(filter.title) !== -1);
  }

}
