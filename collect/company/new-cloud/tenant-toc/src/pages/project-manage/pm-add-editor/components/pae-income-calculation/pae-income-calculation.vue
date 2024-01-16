<template>
  <div class="pae-income-calculation">
    <te-tabs type="border-card" v-model="currentTab">
      <te-tab-pane
        :label="item.nodeDivisionName"
        :name="item.nodeDivision"
        v-for="item in nodePeriods"
        :key="item.nodeDivision"
      >
        <!-- 归属天溯的收益 -->
        <div class="pic-item pic-check">
          <te-checkbox
            v-model="item.affiliationFlag"
            label="归属天溯的收益(不含税)"
            @change="handleSelect($event, item)"
          />
        </div>
        <div class="pic-item pic-radio" v-if="item.affiliationFlag">
          <!-- 选择托管期 -->
          <label>选择托管期</label>
          <te-radio-group v-model="item.periodType" @change="handleValueChange">
            <te-radio v-for="item in periodTypes" :label="item.code">{{ item.name }}</te-radio>
          </te-radio-group>
        </div>
        <div class="pic-item pic-select" v-if="item.affiliationFlag && mapHostPeriodShow(item.periodType)">
          <label>自定义范围</label>
          <te-select-v2
            v-model="item.periodStr"
            :options="hostingScopeList"
            placeholder="请选择"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="1"
            @change="handleValueChange"
          />
        </div>
      </te-tab-pane>
    </te-tabs>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { ref, PropType, onMounted } from 'vue';
// 枚举
import { PM_EProjectIncomeType, PM_EProjectPeriodType } from '../../../constant/enum';
// 常量
import { PM_TIANSU_NODE_ID } from '../../../constant/index';
// api
import { PM_IContractNodePeriod } from '../../pm-add-editor.api';
import { CommonICodeName, Common_IValueLabel } from '@/service/api';
import { PIC_IIncomeCalculationVO } from './pae-income-calculation.api';
// 请求服务
import commonService from '@/service/pkg';
// 工具方法
import { checkExist, mapEnumToArray, mapPeriodListByScope } from '../../utils';
// emits
const emits = defineEmits(['update:nodePeriod']);
// props
const props = defineProps({
  nodePeriod: {
    type: Array as PropType<PM_IContractNodePeriod[]>,
    default: [],
  },
});
// 当前tab
const currentTab = ref<number>(PM_EProjectIncomeType.项目预算表);
// 托管类型
const periodTypes: CommonICodeName<number>[] = Object.entries(PM_EProjectPeriodType)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return {
      code: Number(v),
      name: k,
    };
  });
/**
 * 是否展示自定义托管期
 * @param {number | null} periodType
 * @returns {boolean}
 */
const mapHostPeriodShow = (periodType: number | null): boolean => {
  return periodType !== null && PM_EProjectPeriodType.自定义 === periodType;
};

// 列表数据
const nodePeriods = ref<PIC_IIncomeCalculationVO[]>([]);
// 托管期列表
const hostingScopeList = ref<Common_IValueLabel<number>[]>([]);
/**
 * 切换归属天溯收益多选
 */
const handleSelect = (value: boolean, item: PIC_IIncomeCalculationVO) => {
  if (value) {
    item.periodType = PM_EProjectPeriodType.全周期;
  }
  handleValueChange();
};
/**
 * 修改值
 * @returns {void}
 */
const handleValueChange = (): void => {
  emits(
    'update:nodePeriod',
    nodePeriods.value?.map((item) => ({
      nodeId: item.affiliationFlag ? PM_TIANSU_NODE_ID : null,
      nodeDivision: item.nodeDivision,
      periodType: item.affiliationFlag ? item.periodType : null,
      periodStr: item.periodType === PM_EProjectPeriodType.全周期 ? '' : item.periodStr,
    })),
  );
};
/**
 * 托管期以及首托管期修改，同步更新列表
 * @param dateList
 * @param firstMonth
 * @returns {void}
 */
const updatePeriodList = (dateList: Date[], firstMonth: string): void => {
  hostingScopeList.value = mapPeriodListByScope(dateList, firstMonth);
  nodePeriods.value.forEach((item) => {
    if (item.periodType === PM_EProjectPeriodType.自定义) {
      item.periodStr = item.periodStr?.filter(
        (item) => hostingScopeList.value?.findIndex((cItem) => cItem.value === item) !== -1,
      );
    }
  });
  // 更新父组件数据
  handleValueChange();
};
/**
 * 初始化
 */
onMounted(async () => {
  if (props.nodePeriod && props.nodePeriod?.length !== 0) {
    props.nodePeriod?.forEach((item) => {
      nodePeriods.value.push({
        nodeId: item.nodeId,
        nodeDivision: item.nodeDivision,
        nodeDivisionName: item.nodeDivision !== null ? PM_EProjectIncomeType[item.nodeDivision] : '',
        affiliationFlag: item.nodeId + '' === PM_TIANSU_NODE_ID,
        periodType: checkExist(item.periodType, mapEnumToArray(PM_EProjectPeriodType)),
        periodStr: item?.periodStr ?? [],
      });
    });
  } else {
    nodePeriods.value = [
      {
        nodeId: PM_TIANSU_NODE_ID,
        nodeDivision: PM_EProjectIncomeType.项目预算表,
        nodeDivisionName: '项目预算表',
        affiliationFlag: true,
        periodType: PM_EProjectPeriodType.全周期,
        periodStr: [],
      },
      {
        nodeId: PM_TIANSU_NODE_ID,
        nodeDivision: PM_EProjectIncomeType.项目核算表,
        nodeDivisionName: '项目核算表',
        affiliationFlag: true,
        periodType: PM_EProjectPeriodType.自定义,
        periodStr: [],
      },
    ];
    // 更新父组件数据
    handleValueChange();
  }
  try {
    const list: CommonICodeName<number>[] = await commonService.queryProjectHostingScope();
    hostingScopeList.value =
      list?.map((item) => ({
        value: item.code,
        label: item.name,
      })) ?? [];
  } catch (error) {
    hostingScopeList.value = [];
  }
});
// 对外暴露
defineExpose({
  updatePeriodList,
});
</script>
<style lang="less" scoped>
.pae-income-calculation {
  width: 100%;

  :deep(.te-tabs) {
    width: 100%;

    .te-tab-pane {
      display: flex;
      flex-direction: column;
      gap: var(--te-space-8);
    }

    .pic-item {
      display: flex;
      align-items: center;

      label {
        margin-right: var(--te-space-12);
      }

      .te-select-v2 {
        width: 100%;

        .te-tag__content {
          line-height: normal;
        }
      }
    }
  }
}
</style>
