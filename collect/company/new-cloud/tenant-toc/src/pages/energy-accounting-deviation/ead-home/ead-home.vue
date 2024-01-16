<template>
  <div class="ead-home" v-loading="loading">
    <!-- 脑图 -->
    <div ref="elChart" class="eh-chart"></div>
    <!-- 缩放尺寸 -->
    <div ref="elZoom" class="eh-zoom">{{ zoom }}</div>
    <!-- 缺省 -->
    <div class="eh-empty" :ghost="eadBaseService.isEmpty && !loading">
      <img src="@/assets/images/common/common-data-unset.svg" alt="empty" />
      <span>暂无数据</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
// 服务
import { EadChartService } from './ead-home.service';
import eadBaseService from '../energy-accounting-deviation.service';
import { EadIBrainMapNode } from './ead-home.api';
// 用于触发可观察对象的takeUntil
const destroy$ = new Subject<void>();
// 图表dom
const elChart = ref<HTMLDivElement>();
// 缩放渲染dom
const elZoom = ref<HTMLDivElement>();
// 页面loading
const loading = ref<boolean>(true);
// 页面缩放尺寸
const zoom = ref<string>('100%');
/**
 * 展示当前缩放尺寸
 */
function showZoom(): void {
  elZoom.value?.animate(
    [
      { opacity: 1, offset: 0.2, easing: 'ease-out' },
      { opacity: 1, offset: 0.8, easing: 'ease-in' },
    ],
    { duration: 1500 },
  );
}
/**
 * 初始化图表服务，订阅数据
 */
onMounted(() => {
  const eadChart = new EadChartService(elChart.value!);
  eadBaseService.eadLoading$.pipe(takeUntil(destroy$)).subscribe((v: boolean) => {
    loading.value = v;
  });
  eadBaseService.eadMindMap$.pipe(takeUntil(destroy$)).subscribe((v: EadIBrainMapNode | null) => {
    eadChart.clear();
    if (v) {
      eadChart.render(v, false);
    }
  });
  eadChart.evZoomChange$
    .pipe(takeUntil(destroy$), distinctUntilChanged())
    .subscribe((v: number) => ((zoom.value = `${(v * 100).toFixed()}%`), showZoom()));
});
/**
 * 组件销毁
 */
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});
</script>
<style lang="less" scoped>
.ead-home {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .eh-chart {
    width: 100%;
    height: 100%;

    :deep(.g6-graph-watermarker) {
      z-index: 0 !important;
    }
  }

  > .eh-zoom {
    padding: 6px 22px;
    position: absolute;
    bottom: 110px;
    left: 50%;
    color: white;
    opacity: 0;
    background-color: fade(black, 45%);
    border-radius: 4px;
    pointer-events: none;
  }

  .eh-empty {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    color: fade(black, 25%);

    &[ghost='false'] {
      display: none;
    }
  }
}
</style>
