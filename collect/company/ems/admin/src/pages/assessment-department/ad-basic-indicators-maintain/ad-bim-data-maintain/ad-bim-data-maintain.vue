<template>
  <page-common
    id="ad-bim-data-maintain"
    class="ad-bim-data-maintain"
    title="基础指标维护"
    v-loading="dataMaintain.loading"
  >
    <template v-slot:pageContent>
      <section class="ad-bdm-back flex-row-start-center">
        <i class="iconfont icon-a-arrowleft-outlined3x" @click="goBack" title="返回上一级"></i>
        <span @click="goBack">维护数据</span>
      </section>
      <section class="ad-bdm-toolbar">
        <div class="ad-bdm-toolbar-date flex-row-start-center">
          <i class="iconfont icon-shizhong"></i>
          <span>生效时间：{{ effectiveStartTime }}~{{ effectiveEndTime }}</span>
        </div>
        <div class="ad-bdm-toolbar-btn">
          <button @click="handleDownload" :disabled="downloading">下载模板</button>
          <button primary @click="handleUpload" :disabled="dataMaintain.importing">导入模板</button>
        </div>
      </section>
      <section class="ad-bdm-table" v-if="!dataMaintain.loading">
        <el-table
          border
          :data="dataMaintain.dataSource"
          style="width: 100%"
          :row-class-name="mapRowClassName"
          :cell-class-name="mapCellClassName"
          :span-method="mapColumnMerge"
          :height="height"
        >
          <el-table-column
            :label="childItem.title"
            :min-width="ROW_WIDTH"
            v-for="(childItem, childIndex) in dataMaintain.columns"
            :key="'td_' + childIndex"
          >
            <template #default="scope">
              <!-- 非锁定行且处于编辑状态下展示按钮 -->
              <input
                autofocus
                v-show="
                  !dataMaintain.lockColumns?.includes(childItem.title) &&
                  scope.$index === dataMaintain.editorVO.rowIndex &&
                  dataMaintain.editorVO.colunKey === childItem.title
                "
                type="text"
                v-model="scope.row[childItem.title]"
                v-inputFilter:number
                @blur="dataMaintain.handleCellEdit(scope.row?.[childItem.title])"
                @keydown.enter="dataMaintain.handleCellEdit(scope.row?.[childItem.title])"
              />
              <div
                v-show="
                  !(
                    scope.$index === dataMaintain.editorVO.rowIndex &&
                    dataMaintain.editorVO.colunKey === childItem.title
                  )
                "
                :title="scope.row?.[childItem.title] + ''"
              >
                {{ scope.row?.[childItem.title] }}
              </div>
              <!-- 非锁定行且非编辑状态下展示按钮 -->
              <i
                title="编辑"
                v-show="dataMaintain.checkEditable(scope.$index, childItem.title)"
                @click="
                  dataMaintain.handleEditorShow($event, scope.$index, childItem.title, scope.row?.[childItem.title])
                "
                class="iconfont icon-a-edit-filled3x"
              ></i>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </template>
  </page-common>

  <!-- 导入异常 -->
  <el-dialog
    v-model="dataMaintain.exceptionVisible"
    title="错误原因"
    width="695px"
    :before-close="dataMaintain.handleClose"
    :close-on-click-modal="false"
  >
    <table style="width: 100%" scroll-y>
      <thead :style="{ width: dataMaintain.exceptionList?.length > 10 ? 'calc(100% - 8px)' : '100%' }">
        <tr>
          <th style="width: 80px">序号</th>
          <th>位置</th>
          <th>详情</th>
        </tr>
      </thead>
      <tbody style="max-height: 480px">
        <tr v-for="(item, index) in dataMaintain.exceptionList" :key="'exception_' + index">
          <td style="width: 80px">{{ index + 1 }}</td>
          <td :title="item.position">{{ item.position }}</td>
          <td :title="item.detail">{{ item.detail }}</td>
        </tr>
      </tbody>
    </table>
    <div class="common-table__empty" v-if="dataMaintain.exceptionList?.length === 0">
      <img src="../../../../assets/img/common/common-data-none.svg" alt="暂无数据" />
      <p>暂无数据</p>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ADBIM_IDataMaintainTableVO } from './ad-bim-data-maintain.api';
import { FileDownloadService } from '@/services/download.service';
import { DataMaintainService } from './ad-bim-data-maintain.service';

import { FGetSession } from '../../../../utils/token';

enum EPath {
  下载模板 = '/admin/apportion/basicIndex/maintain/download',
}
const ROW_WIDTH = 180;

const fileDownload = new FileDownloadService('下载', EPath.下载模板);
const dataMaintain = new DataMaintainService();
const destroy$ = new Subject<void>();
const router = useRouter();
const route = useRoute();
const downloading = ref<boolean>(false);

const height = ref<string>('300');

const effectiveStartTime = computed<string>(() => {
  return FGetSession('effectiveStartTime') ? (FGetSession('effectiveStartTime') as string) : '';
});

const effectiveEndTime = computed<string>(() => {
  return FGetSession('effectiveEndTime') ? (FGetSession('effectiveEndTime') as string) : '至今';
});

dataMaintain.query();

onMounted(() => {
  const container = document.querySelector('.content-box');
  nextTick(() => {
    if (container) {
      const containerH = Number(window.getComputedStyle(container, 'height')?.height?.replace('px', ''));
      height.value = String(containerH - 10 - 12 - 22 - 10 - 16 * 2 - 22 - 38 - 20 * 2);
    }
  });

  fromEvent(window, 'resize')
    .pipe(takeUntil(destroy$))
    .subscribe(() => {
      if (container) {
        const containerH = Number(window.getComputedStyle(container, 'height')?.height?.replace('px', ''));
        height.value = String(containerH - 10 - 12 - 22 - 10 - 16 * 2 - 22 - 38 - 20 * 2);
      }
    });
});

onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});

function handleDownload() {
  const recordId = FGetSession('id') ?? '';
  downloading.value = true;
  fileDownload.download(
    recordId,
    () => {
      downloading.value = false;
    },
    () => {
      downloading.value = false;
    },
  );
}

async function handleUpload() {
  if (await dataMaintain.importFile()) {
    dataMaintain.query();
  }
}

function goBack() {
  router.replace({
    path: '/adBasicIndicatorMaintain',
    query: route.query,
  });
}

function mapColumnMerge({
  row,
  column,
  rowIndex,
  columnIndex,
}: {
  row: ADBIM_IDataMaintainTableVO;
  column: any;
  rowIndex: number;
  columnIndex: number;
}) {
  return {
    rowspan: dataMaintain.rowSpans[rowIndex][columnIndex],
    colspan: 1,
  };
}

function mapRowClassName({ row, rowIndex }: { row: ADBIM_IDataMaintainTableVO; rowIndex: number }) {
  return row?.stripeIndex % 2 === 0 ? 'is-stripe' : '';
}

function mapCellClassName({
  row,
  column,
  rowIndex,
  columnIndex,
}: {
  row: ADBIM_IDataMaintainTableVO;
  column: any;
  rowIndex: number;
  columnIndex: number;
}) {
  const title = dataMaintain.columns[columnIndex].title;
  return `${
    !dataMaintain.lockColumns?.includes(title) &&
    rowIndex === dataMaintain.editorVO.rowIndex &&
    dataMaintain.editorVO.colunKey === title
      ? 'editing'
      : ''
  } ${dataMaintain.rowSpans[rowIndex][columnIndex] > 1 ? 'merge' : ''}`;
}
</script>
<style lang="less" scoped>
.ad-bim-data-maintain {
  width: 100%;
  height: 100%;

  :deep(.page-common__container-detail) {
    padding-bottom: 16px;
    padding-top: 16px;

    display: flex;
    flex-direction: column;
  }

  .ad-bdm-back {
    cursor: pointer;
    text-align: left;

    i.iconfont {
      color: var(--color-primary);
      font-size: 22px;
      margin-right: 19px;
    }

    span {
      color: var(--color-text-title);
    }
  }

  .ad-bdm-toolbar {
    margin: 20px 0;

    display: flex;
    flex-direction: row;

    justify-content: space-between;
    align-items: center;

    &-date {
      background: linear-gradient(to right, rgba(93, 213, 254, 0.54), #ffffff);
      padding: 8px 14px;
      border-radius: 32px 0 0 32px;

      i.iconfont {
        font-size: 14px;
        color: var(--color-primary);
        margin-right: 10px;
      }

      span {
        color: var(--color-text);
        line-height: 22px;
        height: 22px;
      }
    }
  }

  .ad-bdm-table {
    width: 100%;
    flex: 1 1 auto;

    :deep(.el-table) {
      tbody tr td {
        position: relative;
        border-bottom: 1px solid var(--color-text-background) !important;

        input {
          width: 100%;
        }

        i.iconfont.icon-a-edit-filled3x {
          cursor: pointer;
          color: var(--color-primary);

          display: none;

          position: absolute;
          top: 50%;
          right: 16px;
          transform: translateY(-50%);

          background-color: transparent;
        }
      }

      tbody tr td:not(.editing):hover {
        i.iconfont.icon-a-edit-filled3x {
          display: inline-block;
        }
      }

      tbody tr td.merge div {
        word-break: break-all;
        white-space: normal;
      }

      tbody tr td,
      tbody tr:hover td {
        background-color: transparent !important;
      }

      tbody tr.is-stripe td,
      tbody tr.is-stripe:hover td {
        background-color: var(--color-table-body) !important;
      }
    }
  }
}
</style>
