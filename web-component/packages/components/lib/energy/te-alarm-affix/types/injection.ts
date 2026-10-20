/** 容器 TE_AL_SERVICES_KEY 注入 services,子组件 inject 解构,仅同一子树内有效 */
import type { InjectionKey } from 'vue';
import type { TeAlServices } from '../hooks/useTeAlBundle';

export const TE_AL_SERVICES_KEY: InjectionKey<TeAlServices> =
  Symbol('teAlServices');
