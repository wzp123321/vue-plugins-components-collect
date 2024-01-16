import { Subject } from 'rxjs';
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';

import { MapService } from './ch-map.service';

export default defineComponent({
  name: 'MapComponent',
  setup() {
    //#region 生命周期
    const _destroy$ = new Subject<void>();

    onMounted(() => {
      service = new MapService(_destroy$, elChart.value!);
    });

    onUnmounted(() => {
      // 销毁订阅
      _destroy$.next();
      _destroy$.complete();
    });
    //#endregion

    //#region 模板引用
    const elChart = ref<HTMLDivElement>();
    //#endregion

    //#region 模块私有服务
    let service: MapService;
    //#endregion

    return { elChart };
  },
});
