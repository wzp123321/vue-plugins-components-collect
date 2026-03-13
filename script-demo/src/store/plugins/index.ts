import { getPlatformToken } from '@/utils/storage';
import { PiniaPluginContext } from 'pinia';

export function piniaPluginInitLoginInfo({ store }: PiniaPluginContext) {
  if (store.$id === 'user') {
    store.setUserState(getPlatformToken());
  }
}
