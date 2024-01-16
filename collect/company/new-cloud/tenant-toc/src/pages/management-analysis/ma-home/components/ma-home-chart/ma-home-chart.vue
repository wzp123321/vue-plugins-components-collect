<template>
  <div id="ma-home-chart" ref="elChart" v-loading="isLoading">
    <div ref="elZoom" class="ma-home-chart-zoom">{{ zoom }}</div>

    <div v-if="!isEmpty" class="ma-home-chart-tool-list" :ghost="isLoading">
      <el-popover popper-class="ma-home-chart-popover" placement="left" trigger="hover" :disabled="!extensions.length">
        <template #reference>
          <div class="ma-home-chart-tool-item">
            <img
              class="ma-home-chart-tool-icon"
              src="@/assets/images/management-analysis/ma-home-chart/ma-home-chart-operate.svg"
              alt="operate"
            />
            <span class="ma-home-chart-tool-name">操作</span>
          </div>
        </template>
        <template #default>
          <el-checkbox-group class="ma-home-chart-popover-list" v-model="selectedCodes" @change="onSelectedCodesChange">
            <el-checkbox v-for="extension in extensions" :key="extension.code" :label="extension.code">
              {{ extension.name }}
            </el-checkbox>
          </el-checkbox-group>
        </template>
      </el-popover>
      <div class="ma-home-chart-tool-item" @click="onZoomClick(0.58)">
        <img
          class="ma-home-chart-tool-icon"
          src="@/assets/images/management-analysis/ma-home-chart/ma-home-chart-zoom-in.svg"
          alt="zoom in"
        />
        <span class="ma-home-chart-tool-name">放大</span>
      </div>
      <div class="ma-home-chart-tool-item" @click="onZoomClick(-0.58)">
        <img
          class="ma-home-chart-tool-icon"
          src="@/assets/images/management-analysis/ma-home-chart/ma-home-chart-zoom-out.svg"
          alt="zoom out"
        />
        <span class="ma-home-chart-tool-name">缩小</span>
      </div>
      <div class="ma-home-chart-tool-item" @click="onSaveClick">
        <img
          class="ma-home-chart-tool-icon"
          src="@/assets/images/management-analysis/ma-home-chart/ma-home-chart-save.svg"
          alt="save"
        />
        <span class="ma-home-chart-tool-name">保存</span>
      </div>
    </div>

    <div class="ma-home-chart-empty" :ghost="!isEmpty">
      <img src="@/assets/images/common/common-data-unset.svg" alt="empty" />
      <span>暂无数据</span>
    </div>

    <MaHCRemarkPopover></MaHCRemarkPopover>
  </div>
</template>

<script lang="ts" setup>
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, throttleTime } from 'rxjs/operators';
import { onMounted, onUnmounted, ref } from 'vue';
import { MA_HOME_EDateType, MA_HOME_INodeExtensionItem, MA_HOME_EQueryType, sDatabase, sInfo } from '../../services';
import { ChartService } from './ma-home-chart.service';

import MaHCRemarkPopover from './ma-h-c-remark-popover/ma-h-c-remark-popover.vue';
import RemarkPopoverService from './ma-h-c-remark-popover/ma-h-c-remark-popover.service';

const destroy$ = new Subject<void>();
const evCodesChange$ = new Subject<readonly string[]>();
const evZoomClick$ = new Subject<number>();
const evSaveClick$ = new Subject<void>();
onMounted(() => {
  const service = new ChartService(elChart.value!);

  fromEvent(window, 'resize')
    .pipe(takeUntil(destroy$), debounceTime(233))
    .subscribe(() => service.resize(elChart.value!.clientWidth, elChart.value!.clientHeight));
  evCodesChange$
    .pipe(
      takeUntil(destroy$),
      debounceTime(233),
      distinctUntilChanged((a, b) => a.length === b.length && a.every((v) => b.includes(v)))
    )
    .subscribe((v) => service.operate(v, extensions.value));
  evZoomClick$.pipe(takeUntil(destroy$), debounceTime(233)).subscribe((v) => service.zoom(v));
  evSaveClick$.pipe(takeUntil(destroy$), throttleTime(888)).subscribe(() => service.save(mapName()));

  service.evZoomChange$
    .pipe(takeUntil(destroy$), distinctUntilChanged())
    .subscribe((v) => ((zoom.value = `${(v * 100).toFixed()}%`), showZoom()));

  sInfo.refNodeExtensions$.pipe(takeUntil(destroy$)).subscribe((v) => {
    extensions.value = v;
    if (selectedCodes.value.length) {
      evCodesChange$.next((selectedCodes.value = []));
    }
  });

  sDatabase.refLoading$.pipe(takeUntil(destroy$)).subscribe((v) => (isLoading.value = v));
  sDatabase.refEmpty$.pipe(takeUntil(destroy$)).subscribe((v) => (isEmpty.value = v));
  sDatabase.refMindMap$
    .pipe(takeUntil(destroy$))
    .subscribe(
      (v) => (
        service.clear(),
        evCodesChange$.next((selectedCodes.value = [])),
        v &&
          service.render(
            v,
            !!sDatabase.dimension && (sDatabase.dateType as MA_HOME_EDateType) !== MA_HOME_EDateType.按月
          )
      )
    );

  sDatabase.bsSearchParam$.pipe(takeUntil(destroy$)).subscribe((v) => {
    service.searchParams = v;
  });

  // 订阅备注相关的结果集
  RemarkPopoverService.rpResult$.pipe(takeUntil(destroy$)).subscribe((v) => {
    service.updateItem(v);
  });
});
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});

const elChart = ref<HTMLDivElement>();
const elZoom = ref<HTMLDivElement>();

const isLoading = ref<boolean>();
const isEmpty = ref<boolean>();

const extensions = ref<MA_HOME_INodeExtensionItem[]>([]);
const selectedCodes = ref<string[]>([]);
const zoom = ref<string>('100%');
function onSelectedCodesChange(selected: string[]): void {
  evCodesChange$.next(selected);
}
function onZoomClick(zoom: number): void {
  evZoomClick$.next(zoom);
}
function onSaveClick(): void {
  evSaveClick$.next();
}
function showZoom(): void {
  elZoom.value?.animate(
    [
      { opacity: 1, offset: 0.2, easing: 'ease-out' },
      { opacity: 1, offset: 0.8, easing: 'ease-in' },
    ],
    { duration: 1500 }
  );
}

function mapName(): string {
  console.log(sDatabase.start);
  switch (sDatabase.dimension) {
    case MA_HOME_EQueryType.建设期:
    case MA_HOME_EQueryType.运营期:
      return sDatabase.dateType === MA_HOME_EDateType.按年
        ? `${sInfo.name}-经营分析-${MA_HOME_EQueryType[sDatabase.dimension]}-${sDatabase.start!.getFullYear()}年`
        : sDatabase.dateType === MA_HOME_EDateType.按月
        ? `${sInfo.name}-经营分析-${MA_HOME_EQueryType[sDatabase.dimension]}-${sDatabase.start!.getFullYear()}年${
            sDatabase.start!.getMonth() + 1
          }月`
        : `${sInfo.name}-经营分析-${MA_HOME_EQueryType[sDatabase.dimension]}-${
            MA_HOME_EDateType[sDatabase.dateType as MA_HOME_EDateType]
          }`;
    case MA_HOME_EQueryType.历史累计:
      return `${sInfo.name}-经营分析-${MA_HOME_EQueryType[sDatabase.dimension]}`;
    default:
      return `${sInfo.name}-经营分析`;
  }
}
</script>

<style lang="less" scope>
#ma-home-chart {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .g6-graph-watermarker {
    z-index: 0 !important;
  }

  > .ma-home-chart-zoom {
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

  .ma-home-chart-tool- {
    &list {
      width: 60px;
      position: absolute;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: stretch;

      &[ghost='true'] {
        visibility: hidden;
      }
    }

    &item {
      height: 68px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 8px;
      background-color: white;
      border: 1px solid rgba(227, 227, 227, 1);
      cursor: pointer;
    }

    &panel {
      padding: 12px;
      position: absolute;
      right: 66px;
      background-color: red;
      border: 1px solid rgba(227, 227, 227, 1);
    }

    &icon {
      width: 20px;
      height: 20px;
    }
    &name {
      line-height: 20px;
    }
  }

  > .ma-home-chart-empty {
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

    &[ghost='true'] {
      display: none;
    }
  }
}

.ma-home-chart-popover {
  width: auto !important;
  min-width: 50px !important;
  padding: 12px !important;
  border: 1px solid rgba(227, 227, 227, 1) !important;

  .ma-home-chart-popover- {
    &list {
      max-height: 140px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;

      > .el-checkbox {
        height: 20px;
        margin-right: 10px;

        > .el-checkbox__label {
          color: fade(black, 65%);
          line-height: 20px;
        }
      }
    }
  }
}
</style>
