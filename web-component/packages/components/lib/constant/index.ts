import type { InjectionKey, Ref } from 'vue';
export const DELAYER_KEY: InjectionKey<Ref<(arg: any) => void>> =
  Symbol('delayer');

// 分页
export const PAGE_SIZES = [10, 20, 30, 40, 50];
