/**
 * 防止ts校验拿不到null下的proxy，封装一层
 */
import { ComponentInternalInstance, getCurrentInstance } from 'vue';
export default function useCurrentInstance() {
  const ctx = getCurrentInstance() as ComponentInternalInstance;
  const proxy =
    ctx &&
    ctx.appContext &&
    ctx.appContext.config &&
    ctx.appContext.config.globalProperties;
  return {
    proxy,
  };
}
