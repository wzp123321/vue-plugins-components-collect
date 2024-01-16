/*
 * @Author: yut
 * @Date: 2023-09-13 15:25:01
 * @LastEditors: yut
 * @LastEditTime: 2023-11-16 19:09:02
 * @Descripttion:
 */
import { Subject, takeUntil } from 'rxjs';
import { defineComponent, onUnmounted, reactive, ref } from 'vue';

import './services/token';

import MenuComponent from './cc-menu/cc-menu.vue';
import TeMenuComponent from './cc-te-menu/cc-te-menu.vue';
import sFrame from './services/cc-frame.service';
import sInfo from './services/cc-info.service';
import { FGetCookie } from '@/core/token';
import { checkTokenInterval } from '@/service';
import { FORBIDDEN_CODES, KEEP_ALIVE_INTERVAL } from '@/config/index';
export default defineComponent({
  name: 'CloudContainerComponent',
  components: {
    'cc-menu': TeMenuComponent,
  },
  setup() {
    //#region 生命周期
    const _destroy$ = new Subject<void>();

    onUnmounted(() => {
      // 销毁订阅
      _destroy$.next();
      _destroy$.complete();
    });
    //#endregion

    //#region 模板引用
    const elFrame = ref<HTMLIFrameElement>();
    //#endregion

    //#region 框架服务
    const oFrame = reactive({
      src: '',
      syncUrl: function () {
        sFrame.syncUrl(elFrame.value?.src.match(/[^\/]+(?!.*\/)/)?.[0]?.split('?')[0]);
      },
    });

    sFrame.refSrc$.pipe(takeUntil(_destroy$)).subscribe((v) => {
      oFrame.src = v;
    });
    //#endregion

    //#region 信息服务
    const oInfo = reactive({
      project: '',
      user: '',
    });

    sInfo.refProject$.pipe(takeUntil(_destroy$)).subscribe((v) => (oInfo.project = v));
    sInfo.refUser$.pipe(takeUntil(_destroy$)).subscribe((v) => (oInfo.user = v));
    //#endregion

    let timer: any;
    /**
     * 设置定时器校验token
     */
    const handleCheckTokenInterval = () => {
      timer = setInterval(async () => {
        try {
          const params = {
            token: FGetCookie('toc-token') ?? '',
          };
          const res = await checkTokenInterval(params);
          if (FORBIDDEN_CODES?.includes(res.data?.code)) {
            clearInterval(timer);
          }
        } catch (error) {
          console.warn('keepAlive----------------error------', error);
        }
      }, KEEP_ALIVE_INTERVAL);
    };

    handleCheckTokenInterval();

    return { elFrame, oFrame, oInfo };
  },
});
