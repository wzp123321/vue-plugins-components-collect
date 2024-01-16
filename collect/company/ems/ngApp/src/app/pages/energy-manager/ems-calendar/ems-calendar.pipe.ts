import { Pipe, PipeTransform } from '@angular/core';
import { ECalendarTitle } from './ems-calendar.api';

@Pipe({
  name: 'emsCalendarTitle',
})
export class EmsCalendarTitlePipe implements PipeTransform {
  transform(value: number): string {
    return ECalendarTitle[value];
  }
}
