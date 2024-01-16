<template>
  <div class="ead-search-bar">
    <!-- 能源类型 -->
    <label class="esb-label">能源类型</label>
    <el-radio-group v-model="searchForm.energyCode" @change="handleEnergyChange">
      <el-radio-button v-for="item in energyCodeList" :key="item.code" :label="item.code" :value="item.code">
        {{ item.name }}
      </el-radio-button>
    </el-radio-group>
    <!-- 托管类型 -->
    <label class="esb-label esb-gap">周期类型</label>
    <el-radio-group v-model="searchForm.periodType" @change="handlePeriodTypeChange">
      <el-radio-button v-for="item in periodTypeList" :key="item.code" :label="item.code" :value="item.code">
        {{ item.name }}
      </el-radio-button>
    </el-radio-group>
    <!-- 日期 -->
    <label class="esb-label esb-gap">日期</label>
    <!-- 托管期 -->
    <el-select
      v-show="mapIsTrustDate()"
      v-model="searchForm.hostingPeriodIndex"
      class="esb-period-select"
      @change="handlePeriodIndexChange"
    >
      <el-option v-for="item in hostPeriodList" :key="item.code" :label="item.name" :value="item.code"></el-option>
    </el-select>
    <!-- 年&月 -->
    <div v-show="!mapIsTrustDate()">
      <DateRangePicker
        :clearable="false"
        :width="DATE_PICKER_WIDTH"
        :format="dateFormat"
        :mode="dateType"
        v-model:value="searchForm.yearMonthStr"
        :disabledDate="mapDateDisabled"
        :disabledStartYear="mapDisableStartYear"
        :disabledEndYear="mapDisableEndYear"
      ></DateRangePicker>
    </div>
    <button class="esb-gap" primary @click="query">查询</button>
    <button @click="reset">重置</button>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
// 服务相关
import { ECommonPath } from '@/service/path';
import commonService from '@/service/pkg';
import eadBaseService from '../energy-accounting-deviation.service';
import { postRequest } from '@/service/request';
// 类型相关
import { CommonICodeName } from '../../../service/api/index';
import { EadEDatePickerType, EadISearchForm, DATE_PICKER_WIDTH } from './ead-search-bar.api';
import {
  EccEPath,
  EccIDateScopeVO,
  EccSbEPeriodType,
} from '@/pages/energy-consumption-control/components/ecc-search-bar/ecc-search-bar.api';
import { BmSbIHostPeriodVO } from '@/pages/boundary-management/bm-search-bar/bm-search-bar.api';
// 工具类
import message from '@/utils/message';
import { getTenant } from '../../../utils/index';
// 能源类型列表
const energyCodeList = ref<CommonICodeName[]>([]);
// 托管类型列表
const periodTypeList = ref<CommonICodeName[]>([]);
// 托管期列表
const hostPeriodList = ref<BmSbIHostPeriodVO[]>([]);
// 户号数据录入截止时间
const lastTimeStamp = ref<EccIDateScopeVO>({
  startTimeMillis: null,
  endTimeMillis: null,
});
// 查询表单
const searchForm = ref<EadISearchForm>({
  energyCode: '',
  hostingPeriodIndex: null,
  yearMonthStr: [],
  periodType: '',
  hostingAreaId: null,
});
// 根据托管类型返回的时间范围查询类型
const dateType = computed(() => {
  return searchForm.value.periodType === EccSbEPeriodType.按年 ? EadEDatePickerType.年范围 : EadEDatePickerType.月范围;
});
// 根据托管类型返回的格式化类型
const dateFormat = computed(() => {
  return searchForm.value.periodType === EccSbEPeriodType.按年 ? 'YYYY' : 'YYYY-MM';
});
// 是否是按托管期查询
function mapIsTrustDate() {
  return searchForm.value.periodType === EccSbEPeriodType.按托管期;
}
// 日期禁用
function mapDateDisabled(date: Date) {
  return (
    lastTimeStamp.value?.endTimeMillis === null ||
    date.getTime() > lastTimeStamp.value?.endTimeMillis ||
    lastTimeStamp.value?.startTimeMillis === null ||
    date.getTime() < lastTimeStamp.value?.startTimeMillis
  );
}
/**
 * 开始年禁用
 * @param current
 */
function mapDisableStartYear(current: Date) {
  // 时间选择不得超过户号录入最新时间
  // 如果选择了结束年，则开始年不能超过结束年
  return (
    (lastTimeStamp.value?.startTimeMillis && current.getTime() < lastTimeStamp.value?.startTimeMillis) ||
    (lastTimeStamp.value?.endTimeMillis && current.getTime() > lastTimeStamp.value?.endTimeMillis) ||
    (searchForm.value?.yearMonthStr?.length === 2 && current.getTime() > searchForm.value?.yearMonthStr?.[1]?.getTime())
  );
}
/**
 * 结束年禁用
 * @param current 当前时间
 */
function mapDisableEndYear(current: Date) {
  // 如果有户号数据录入最新时间
  if (lastTimeStamp.value) {
    return (
      (lastTimeStamp.value?.startTimeMillis && current.getTime() < lastTimeStamp.value?.startTimeMillis) ||
      (lastTimeStamp.value?.endTimeMillis && current.getTime() > lastTimeStamp.value?.endTimeMillis) ||
      (searchForm.value.yearMonthStr?.[0] && current.getTime() < searchForm.value.yearMonthStr?.[0].getTime())
    );
  }
  return true;
}
/**
 * 初始化
 * 初始化托管类型、能源类型、托管周期、户号录入最新时间等，最后调用查询方法
 */
onMounted(async () => {
  initPeriodType();
  await initEnergyList();
  await initByPeriodType();
  eadBaseService.query(searchForm.value, lastTimeStamp.value, true);
});
/**
 * 查询
 */
function query() {
  eadBaseService.query(searchForm.value, lastTimeStamp.value);
}
/**
 * 重置
 */
async function reset() {
  searchForm.value.periodType = periodTypeList.value?.[0].code ?? '';
  searchForm.value.yearMonthStr = [];
  await initEnergyList();
  await initByPeriodType();
  eadBaseService.query(searchForm.value, lastTimeStamp.value);
}
/**
 * 切换能源类型
 */
function handleEnergyChange() {
  hostPeriodList.value?.forEach((item) => {
    if (item.status) {
      searchForm.value.hostingPeriodIndex = item.code;
    }
  });
  initByPeriodType();
}
/**
 * 切换托管类型
 */
async function handlePeriodTypeChange() {
  await queryLastTimeStamp();
  if (searchForm.value.periodType === EccSbEPeriodType.按托管期) {
    queryPeriodIndexListByEnergyCode();
  }
}
/**
 * 切换托管周期
 * @param {number} value
 */
const handlePeriodIndexChange = (value: number) => {
  searchForm.value.yearMonthStr = [];
  hostPeriodList.value.forEach((item) => {
    if (value === item.code) {
      let startDate = new Date();
      startDate.setFullYear(item.start.year);
      startDate.setMonth(item.start.monthOfYear - 1);
      let endDate = new Date();
      endDate.setFullYear(item.end.year);
      endDate.setMonth(item.end.monthOfYear - 1);
      searchForm.value.yearMonthStr = [startDate, endDate];
    }
  });
};
/**
 * 初始化能源类型列表
 */
async function initEnergyList() {
  try {
    const res = await commonService.queryBaseHead(getTenant(), ECommonPath.查询能源类型);
    if (res?.success) {
      energyCodeList.value = res?.data ?? [];
      searchForm.value.energyCode = energyCodeList.value?.[0]?.code ?? '';
    } else {
      searchForm.value.energyCode = '';
      energyCodeList.value = [];
    }
  } catch (error) {
    searchForm.value.energyCode = '';
    energyCodeList.value = [];
  }
}
/**
 * 根据托管类型初始化托管区域或者户号录入最新时间
 * @param energyCode 能源类型
 */
async function initByPeriodType() {
  await queryLastTimeStamp();
  // 如果是按托管期查询，则查询托管期列表，如果是按年或者按月则查询户号录入最新时间
  if (searchForm.value.periodType === EccSbEPeriodType.按托管期) {
    await queryPeriodIndexListByEnergyCode();
  }
}
/**
 * 根据枚举初始化托管类型
 */
function initPeriodType() {
  periodTypeList.value = Object.entries(EccSbEPeriodType)
    .filter(([k, v]) => {
      return typeof v === 'string';
    })
    .map(([k, v]) => {
      return {
        code: v,
        name: k,
      };
    });
  if (periodTypeList.value?.length) {
    searchForm.value.periodType = periodTypeList.value?.[0].code;
  }
}
/**
 * 根据查询托管周期
 */
async function queryPeriodIndexListByEnergyCode() {
  try {
    const res = await commonService.queryBaseHead<BmSbIHostPeriodVO[]>(
      mapQueryParams(),
      ECommonPath['查询n托管期信息 （根据户号录入最新时间进行截止）'],
    );
    if (res?.success) {
      hostPeriodList.value = res?.data ?? [];
      hostPeriodList.value?.forEach((item) => {
        if (item.status) {
          searchForm.value.hostingPeriodIndex = item.code;
          handlePeriodIndexChange(searchForm.value.hostingPeriodIndex);
        }
      });
    } else {
      hostPeriodList.value = [];
      searchForm.value.hostingPeriodIndex = null;
      // 如果是没有录入过数据，需要给特殊提示
      if (res?.code === 500 && res?.message) {
        message.error(res?.message);
      }
    }
  } catch (error) {
    hostPeriodList.value = [];
    searchForm.value.hostingPeriodIndex = null;
  }
}
/**
 * 查询最新户号数据录入时间戳
 */
async function queryLastTimeStamp() {
  try {
    const res = await postRequest(EccEPath.查询能耗管控时间可选范围, {
      ...getTenant(),
      energyCode: searchForm.value.energyCode,
    });
    if (res?.success) {
      lastTimeStamp.value = res?.data ?? null;
      searchForm.value.yearMonthStr =
        lastTimeStamp.value?.startTimeMillis && lastTimeStamp.value?.endTimeMillis
          ? [new Date(lastTimeStamp.value?.endTimeMillis), new Date(lastTimeStamp.value?.endTimeMillis)]
          : [];
    } else {
      lastTimeStamp.value.startTimeMillis = null;
      lastTimeStamp.value.endTimeMillis = null;
      searchForm.value.yearMonthStr = [];
      // 如果是没有录入过数据，需要给特殊提示
      if (res?.code === 500 && res?.message) {
        message.error(res?.message);
      }
    }
  } catch (error) {
    lastTimeStamp.value.startTimeMillis = null;
    lastTimeStamp.value.endTimeMillis = null;
    searchForm.value.yearMonthStr = [];
  }
}
/**
 * 拼接查询参数
 */
function mapQueryParams() {
  return {
    ...getTenant(),
    energyCode: searchForm.value.energyCode,
  };
}
</script>
<style lang="less" scoped>
.ead-search-bar {
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
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

  .esb-period-select {
    width: 280px;
  }

  .esb-label {
    margin-right: 8px;
  }

  .esb-gap {
    margin-left: 20px;
  }
}
</style>
