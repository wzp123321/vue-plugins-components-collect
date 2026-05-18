import { computed, type MaybeRef, toValue } from 'vue';
import { filterNumberValue } from '@/directives/directive-filter/directive-filter.utils';
import type { IDirectiveNumberBindingVO } from '@/directives/directive-filter/directive-filter.api';

export function useNumberFilter(options: MaybeRef<Partial<IDirectiveNumberBindingVO>> = {}) {
  const filter = (value: string): string => filterNumberValue(value, toValue(options));

  const filtered = (value: MaybeRef<string>) => computed(() => filter(toValue(value)));

  return { filter, filtered };
}
