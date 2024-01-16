<template>
  <div class="ecc-search-bar" id="ecc-search-bar">
    <label class="mr8">能源类型</label>
    <el-radio-group v-model="searchForm.energyCode" @change="handleEnergyChange">
      <el-radio-button v-for="(item, index) in energyCodeList" :key="item.code" :label="item.code" :value="item.code">
        {{ item.name }}
      </el-radio-button>
    </el-radio-group>
    <label class="mr8 ml20">周期类型</label>
    <el-radio-group v-model="searchForm.periodType" @change="handlePeriodTypeChange">
      <el-radio-button v-for="(item, index) in periodTypeList" :key="item.code" :label="item.code" :value="item.code">
        {{ item.name }}
      </el-radio-button>
    </el-radio-group>
    <label class="mr8 ml20">日期</label>
    <!-- 托管期 -->
    <el-select
      v-show="mapIsTrustDate()"
      v-model="searchForm.hostingPeriodIndex"
      @change="handlePeriodIndexChange"
      class="esb-period-select"
    >
      <el-option
        v-for="(item, index) in hostPeriodList"
        :key="'date_' + index"
        :label="item.name"
        :value="item.code"
      ></el-option>
    </el-select>
    <!-- 年&月 -->
    <div v-show="!mapIsTrustDate()">
      <DateRangePicker
        :clearable="false"
        :width="328"
        :format="dateFormat"
        :mode="dateType"
        v-model:value="searchForm.yearMonthStr"
        :disabled-date="mapDateDisabled"
        :disabledStartYear="mapDisableStartYear"
        :disabledEndYear="mapDisableEndYear"
      ></DateRangePicker>
    </div>
    <label class="mr8 ml20" v-if="hostAreaList.length > 1">托管区域</label>
    <el-select v-model="searchForm.hostingAreaId" v-if="hostAreaList.length > 1">
      <el-option
        v-for="(item, index) in hostAreaList"
        :key="'date_' + index"
        :label="item.name"
        :value="item.id"
      ></el-option>
    </el-select>
    <button class="ml20" primary @click="query">查询</button>
    <button @click="reset">重置</button>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { getTenant } from '../../../../utils/index';

import { ECommonPath } from '@/service/path';
import commonService from '@/service/pkg';
import { CommonICodeName, CommonIHttpRes, Common_TS_IIdName } from '../../../../service/api/index';
import { BmSbIHostPeriodVO } from '@/pages/boundary-management/bm-search-bar/bm-search-bar.api';
import { Ecc_ISearchForm, EccEPath, EccIDateScopeVO, EccSbEPeriodType } from './ecc-search-bar.api';
import eccBaseData from '../../energy-consumption-control.service';
import { postRequest } from '@/service/request';
import message from '@/utils/message';

//#region
// 能源类型
const energyCodeList = ref<CommonICodeName[]>([]);
// 周期类型
const periodTypeList = ref<CommonICodeName[]>([]);
// 托管期列表
const hostPeriodList = ref<BmSbIHostPeriodVO[]>([]);
// 托管区域
const hostAreaList = ref<Common_TS_IIdName<string>[]>([]);
// 可选时间
const lastTimeStamp = ref<EccIDateScopeVO>({
  startTimeMillis: null,
  endTimeMillis: null,
});
const searchForm = ref<Ecc_ISearchForm>({
  energyCode: '',
  hostingAreaId: '',
  hostingPeriodIndex: null,
  yearMonthStr: [],
  periodType: '',
});
const dateType = computed(() => {
  return searchForm.value.periodType === EccSbEPeriodType.按年 ? 'yearrange' : 'monthrange';
});
const dateFormat = computed(() => {
  return searchForm.value.periodType === EccSbEPeriodType.按年 ? 'YYYY' : 'YYYY-MM';
});

onMounted(async () => {
  initPeriodType();
  await initEnergyList();
  await initByEnergyCode();
  eccBaseData.query(searchForm.value, lastTimeStamp.value, false);
});
// 是否是按托管期查询
function mapIsTrustDate() {
  return searchForm.value.periodType === EccSbEPeriodType.按托管期;
}
/**
 * 查询
 */
function query() {
  eccBaseData.query(searchForm.value, lastTimeStamp.value);
}
/**
 * 重置
 */
async function reset() {
  searchForm.value.hostingAreaId = '';
  searchForm.value.periodType = periodTypeList.value?.[0].code ?? '';
  searchForm.value.yearMonthStr = [];

  await initEnergyList();
  await initByEnergyCode();
  eccBaseData.query(searchForm.value, lastTimeStamp.value);
}
/**
 * 切换能源类型
 */
function handleEnergyChange() {
  searchForm.value.hostingAreaId = '';
  hostPeriodList.value?.forEach((item) => {
    if (item.status) {
      searchForm.value.hostingPeriodIndex = item.code;
    }
  });
  initByEnergyCode();
}
/**
 * 切换托管类型
 */
async function handlePeriodTypeChange() {
  queryLastTimeStamp();
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
 * 初始化
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
 * 初始化区域列表
 * @param energyCode 能源类型
 */
async function initByEnergyCode() {
  const promiseArr = [queryPeriodAreaListByEnergyCode(), queryLastTimeStamp()];
  if (searchForm.value.periodType === EccSbEPeriodType.按托管期) {
    promiseArr.push(queryPeriodIndexListByEnergyCode());
  }

  await Promise.all(promiseArr);
}
/**
 * 初始化托管类型
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
 * 根据查询托管区域
 */
async function queryPeriodAreaListByEnergyCode() {
  try {
    const res = await postRequest(ECommonPath.根据分类分析查询此租户的托管区域, mapQueryParams());

    if (res?.success) {
      hostAreaList.value = res?.data?.map((item: Common_TS_IIdName<string>) => {
        return {
          id: String(item.id),
          name: item.name,
        };
      });
      searchForm.value.hostingAreaId = '';
    } else {
      hostAreaList.value = [];
      searchForm.value.hostingAreaId = '';
    }
  } catch (error) {
    hostAreaList.value = [];
    searchForm.value.hostingAreaId = '';
  } finally {
    hostAreaList.value.unshift({
      id: '',
      name: '全部',
    });
  }
}
/**
 * 查询最新户号数据录入时间戳
 */
async function queryLastTimeStamp() {
  try {
    const res: CommonIHttpRes<EccIDateScopeVO> = await postRequest(EccEPath.查询能耗管控时间可选范围, {
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

      if (res?.code === 500 && res?.message) {
        message.error(res?.message);
      }
    }
  } catch (error) {
    searchForm.value.yearMonthStr = [];
    lastTimeStamp.value.startTimeMillis = null;
    lastTimeStamp.value.endTimeMillis = null;
  }
}
function mapQueryParams() {
  return {
    ...getTenant(),
    energyCode: searchForm.value.energyCode,
  };
}
/**
 * 月时间范围禁用
 * @param date
 */
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
  return (
    (lastTimeStamp.value?.startTimeMillis && current.getTime() < lastTimeStamp.value?.startTimeMillis) ||
    (lastTimeStamp.value?.endTimeMillis && current.getTime() > lastTimeStamp.value?.endTimeMillis) ||
    (searchForm.value?.yearMonthStr?.length === 2 && current.getTime() > searchForm.value?.yearMonthStr?.[1]?.getTime())
  );
}
/**
 * 结束年禁用
 * @param current
 */
function mapDisableEndYear(current: Date) {
  if (lastTimeStamp.value) {
    return (
      (lastTimeStamp.value?.startTimeMillis && current.getTime() < lastTimeStamp.value?.startTimeMillis) ||
      (lastTimeStamp.value?.endTimeMillis && current.getTime() > lastTimeStamp.value?.endTimeMillis) ||
      (searchForm.value.yearMonthStr?.[0] && current.getTime() < searchForm.value.yearMonthStr?.[0].getTime())
    );
  }
  return true;
}
</script>
<style lang="less" scoped>
#ecc-search-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  > label {
    height: 36px;
    line-height: 36px;
  }

  > label,
  > div,
  > button {
    margin-bottom: 10px;
  }

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
}
</style>
