import { computed, type MaybeRef, toValue } from 'vue';
import { filterTextValue } from '@/directives/directive-filter/directive-filter.utils';
import type { IDirectiveTextBindingVO } from '@/directives/directive-filter/directive-filter.api';

export function useTextFilter(options: MaybeRef<Partial<IDirectiveTextBindingVO>> = {}) {
  const filter = (value: string): string => filterTextValue(value, toValue(options));

  const filtered = (value: MaybeRef<string>) => computed(() => filter(toValue(value)));

  return { filter, filtered };
}
