<template>
  <div class="dsp-detail">
    <div class="dd-header flex-row-justify-center">
      <span class="dd-header-title">科室考核明细</span>
      <te-button
        type="primary"
        :disabled="assessmentDetailTableList?.headList?.length === 0 || isExporting"
        @click="handleDetailExport"
        >导出</te-button
      >
    </div>
    <div v-loading="loading">
      <template v-if="assessmentDetailTableList?.headList?.length && !loading">
        <!-- 明细表格 -->
        <te-table
          :data="assessmentDetailTableList.bodyList"
          style="width: 100%"
          stripe
          :height="mapTableHeight(assessmentDetailTableList.bodyList)"
        >
          <te-table-column
            v-for="(item, index) in assessmentDetailTableList.headList"
            :prop="item"
            align="center"
            :width="mapColumnWidth(index)"
          >
            <template #header>
              <div class="dsp-table-header">
                <div :title="item">{{ item }}</div>
                <te-tooltip
                  placement="top"
                  effect="dark"
                  v-if="item === '能耗增长率实际值(%)' || item === '能耗增长率目标值(%)'"
                >
                  <template #content>
                    <div style="white-space: normal; word-break: break-all">
                      能耗增长率 = (本月能耗值-上月能耗值)/上月能耗值*100%
                    </div>
                  </template>
                  <icon-explain />
                </te-tooltip>
              </div>
            </template>
            <template #default="scope">
              <span
                :class="{ 'dd-column-error': scope.row?.redColumns?.includes(item) }"
                :title="thousandSeparation(scope.row[item])"
                >{{ thousandSeparation(scope.row[item]) }}</span
              >
            </template>
          </te-table-column>
        </te-table>
      </template>
      <!-- 缺省 -->
      <no-data
        v-show="assessmentDetailTableList?.headList?.length === 0 && !loading"
        :imgUrl="require('../../../../../assets/img/common/common-empty.svg')"
        :marginTop="20"
        :height="160"
      ></no-data>
    </div>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { ref, onMounted, onUnmounted } from 'vue';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
// 组件
import { TeButton, TeTable, TeTableColumn } from '@tiansu/element-plus';
import { IconExplain } from '@arco-iconbox/vue-te';

// 工具方法
import { thousandSeparation } from '../../../../../utils/index';
// 服务 api
import departmentAssessmentService from '../../department-assessment.service';
import commonService from '../../../../../services/common/common.service';
import resultPublicityService from '../da-result-publicity.service';
import {
  DRP_ESortType,
  DRP_IConvertBodyVO,
  DRP_IConvertDetailTableVO,
  DRP_IQueryParams,
} from '../da-result-publicity.api';
import { DA_EPath } from '../../department-assessment.api';
import { DD_HEADER_HEIGHT, DD_MAX_ROW_VIEW_COUNT, DD_ROW_HEIGHT } from './dsp-detail.api';
// 可观察对象
const destroy$ = new Subject<void>();
// 查询参数
const queryParams = ref<DRP_IQueryParams>({
  energyCode: '',
  queryTime: '',
  indexId: undefined,
  rankOrder: DRP_ESortType.降序,
  ratioOrder: DRP_ESortType.降序,
});
// 页面loading
const loading = ref<boolean>(true);
// 正在导出
const isExporting = ref<boolean>(false);
// 明细数据
const assessmentDetailTableList = ref<DRP_IConvertDetailTableVO>({
  headList: [],
  bodyList: [],
});
/**
 * 计算表格高度
 * @param {DRP_IConvertBodyVO[]} list
 * @returns {number}
 */
const mapTableHeight = (list: DRP_IConvertBodyVO[]): number => {
  return (
    (list?.length < DD_MAX_ROW_VIEW_COUNT ? list?.length * DD_ROW_HEIGHT : DD_MAX_ROW_VIEW_COUNT * DD_ROW_HEIGHT) +
    DD_HEADER_HEIGHT
  );
};
/**
 * 处理列宽，第一列宽度固定
 * @param {number} index
 * @returns {string}
 */
const mapColumnWidth = (index: number) => {
  return index === 0 ? '60' : 'auto';
};
/**
 * 导出科室明细
 */
const handleDetailExport = () => {
  // 如果正在导出
  if (isExporting.value) {
    return;
  }
  isExporting.value = true;
  commonService.getFileStreamDownload(
    queryParams.value,
    DA_EPath.导出科室考核明细,
    '导出',
    () => {
      isExporting.value = false;
    },
    () => {
      isExporting.value = false;
    },
  );
};
/**
 * 初始化订阅数据
 */
onMounted(() => {
  // 订阅配置信息
  departmentAssessmentService.configResult$.pipe(takeUntil(destroy$)).subscribe((v) => {
    const unConfigureFlag =
      !v?.configFlag || v?.energyCodeList?.length === 0 || v?.indexIdList?.length === 0 || v?.treeIdList?.length === 0;
    if (unConfigureFlag) {
      assessmentDetailTableList.value.headList = [];
      assessmentDetailTableList.value.bodyList = [];
    }
  });
  // 订阅查询参数
  resultPublicityService.queryParams.pipe(takeUntil(destroy$)).subscribe((v) => {
    queryParams.value = {
      ...v,
    };
  });
  // 订阅查询结果
  resultPublicityService.assessDetailResult.pipe(takeUntil(destroy$)).subscribe((v) => {
    assessmentDetailTableList.value = {
      ...v,
    };
  });
  // 订阅loading
  resultPublicityService.detailLoading.pipe(takeUntil(destroy$)).subscribe((v) => {
    loading.value = v;
  });
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
.dsp-detail {
  width: 100%;
  min-height: 264px;

  .dd-header {
    margin-top: 24px;
    margin-bottom: 16px;

    .dd-header-title {
      color: var(--te-text-color-primary);
      font-family: PingFang SC;
      font-weight: 600;
      font-size: var(--te-font-size-h16);
      line-height: 24px;
    }
  }

  .dd-column-error {
    color: var(--te-color-danger);
  }
  .dsp-table-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    > div {
      color: var(--te-text-color-secondary);
      font-family: PingFang SC;
      font-weight: 600;
      font-size: var(--te-font-size-b14);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
