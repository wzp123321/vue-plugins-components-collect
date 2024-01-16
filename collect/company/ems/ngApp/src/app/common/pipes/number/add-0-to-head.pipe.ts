import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'add0ToHead',
})
export class Add0ToHeadPipe implements PipeTransform {
  transform(value: number, length: number = 0): string {
    return value.toString().padStart(length, '0');
  }
}
