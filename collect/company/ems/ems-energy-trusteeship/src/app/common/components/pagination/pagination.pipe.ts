import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pagination',
})
export class PaginationPipe implements PipeTransform {
  transform<T = any>(target: T[], index: number = 1, size: number = 10): T[] {
    return target.slice(size * (index - 1), size * index);
  }
}
