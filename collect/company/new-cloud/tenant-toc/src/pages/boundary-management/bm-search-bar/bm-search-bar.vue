<template>
  <div class="bm-search-bar flex-wrap flex-row-start-center" id="bm-search-bar">
    <label for="host-period" class="mr8">日期</label>
    <el-select
      name="host-period"
      v-model="searchForm.hostingPeriod"
      class="bm-sb-period-select"
      @change="handlePeriodChange"
    >
      <el-option
        v-for="(item, index) in hostPeriodList"
        :key="'date_' + index"
        :label="item.name"
        :value="item.code"
      ></el-option>
    </el-select>
    <label for="measure-type" class="mr8 ml20">计量类型</label>
    <el-radio-group name="measure-type" v-model="searchForm.measureType">
      <el-radio-button
        v-for="(item, index) in measureTypeList"
        :key="'date_' + index"
        :label="item.code"
        :value="item.code"
      >
        {{ item.name }}
      </el-radio-button>
    </el-radio-group>
    <label for="verification-type" class="mr8 ml20">核定类型</label>
    <el-radio-group name="verification-type" v-model="searchForm.verificationType">
      <el-radio-button
        v-for="(item, index) in verificationTypeList"
        :key="'date_' + index"
        :label="item.code"
        :value="item.code"
      >
        {{ item.name }}
      </el-radio-button>
    </el-radio-group>
    <button class="ml20" primary @click="query(false)">查询</button>
    <button @click="reset">重置</button>
  </div>
</template>
<script lang="ts" setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { postRequest } from '@/service/request';
import bmDataService from '../boundary-management.service';

import { getTenant } from '@/utils';

import { ECommonPath } from '@/service/path';
import {
  BM_IAddManagementForm,
  mapVerificationTypeList,
  mapMeasureTypeList,
  BmSbIHostPeriodVO,
} from './bm-search-bar.api';
import { CommonICodeName } from '@/service/api';
import { BM_BOUNDARY_EVENT_SESSION_KEY } from '../bm-collapse-home/bm-collapse-home.api';
import message from '@/utils/message';

// 计量类型列表
const measureTypeList = computed<CommonICodeName<string>[]>(() => {
  const list = mapMeasureTypeList();
  list.unshift({
    code: '',
    name: '全部',
  });
  return list;
});
// 核定类型列表
const verificationTypeList = computed<CommonICodeName<string>[]>(() => {
  const list = mapVerificationTypeList();
  list.unshift({
    code: '',
    name: '全部',
  });
  return list;
});
// 表单数据
const searchForm = reactive<BM_IAddManagementForm>({
  hostingPeriod: null,
  measureType: '',
  verificationType: '',
  startTime: '',
  endTime: '',
});
// 托管周期列表
const hostPeriodList = ref<BmSbIHostPeriodVO[]>([]);
/**
 * 切换日期
 */
const handlePeriodChange = (value: number | null) => {
  hostPeriodList.value?.forEach((item) => {
    if (item.code === value) {
      searchForm.startTime = mapTime(item.start.year, item.start.monthOfYear);
      searchForm.endTime = mapTime(item.end.year, item.end.monthOfYear);
    }
  });
};
const mapTime = (year: number, month: number) => {
  return `${year}-${month > 9 ? month : '0' + month}`;
};
/**
 * 初始化托管周期
 */
async function initPeriod() {
  try {
    const res = await postRequest(ECommonPath.查询托管期信息, getTenant());
    if (res?.success) {
      hostPeriodList.value = res?.data?.map((item: BmSbIHostPeriodVO) => ({
        code: item.code,
        name: item.name,
        status: item.status,
        start: item.start,
        end: item.end,
      }));
      if (hostPeriodList.value?.length) {
        hostPeriodList.value?.forEach((item) => {
          if (item.status) {
            searchForm.hostingPeriod = item.code;
            searchForm.startTime = mapTime(item.start.year, item.start.monthOfYear);
            searchForm.endTime = mapTime(item.end.year, item.end.monthOfYear);
          }
        });
      }
    } else {
      hostPeriodList.value = [];
    }
  } catch (error) {
    hostPeriodList.value = [];
  } finally {
    bmDataService.hostPeriodList = hostPeriodList.value ?? [];
  }
}
/**
 * 查询
 */
function query(isInitFlag: boolean = false) {
  window.sessionStorage.removeItem(BM_BOUNDARY_EVENT_SESSION_KEY);
  if (!searchForm.hostingPeriod && !isInitFlag) {
    message.error('日期不能为空');
    return;
  }
  bmDataService.query(searchForm);
}
/**
 * 重置
 */
function reset() {
  hostPeriodList.value?.forEach((item) => {
    if (item.status) {
      searchForm.hostingPeriod = item.code ?? null;
    }
  });
  searchForm.measureType = '';
  searchForm.verificationType = '';
  query(false);
}
onMounted(async () => {
  await initPeriod();
  query(true);
});
</script>
<style lang="less" scoped>
#bm-search-bar {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-text-border);

  :deep(.el-radio-group) {
    .el-radio-button.is-active {
      .el-radio-button__inner {
        background-color: transparent;
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
    }

    .el-radio-button__inner {
      line-height: 22px;
      padding: 6px 16px;
      box-sizing: border-box;
    }
  }
}
</style>
