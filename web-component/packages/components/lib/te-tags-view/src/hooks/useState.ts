import type { Ref } from 'vue';
import { ref } from 'vue';

export default function useState<T, R = Ref<T>>(
  defaultStateValue?: T | (() => T),
): [R, (_val: T) => void] {
  const initValue: T =
    typeof defaultStateValue === 'function'
      ? (defaultStateValue as any)()
      : defaultStateValue;
  const innerValue = ref(initValue) as Ref<T>;
  const triggerChange = (val: T) => {
    innerValue.value = val;
  };
  return [innerValue as unknown as R, triggerChange];
}
