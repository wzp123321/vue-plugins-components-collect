<template>
  <div class="pae-unit-price-adjustment">
    <!-- 有数据的情况 -->
    <te-tabs :class="{ 'pupa-empty': props.disabledFlag }" type="border-card" v-model="currentCode">
      <!-- 禁用状态 -->
      <!-- 调整方式 -->
      <div v-if="props.emptyFlag" class="pupa-item pupa-item-way">
        <label>调整方式</label>
        <te-select :disabled="true" placeholder="请选择"> </te-select>
      </div>
      <!-- tab -->
      <te-tab-pane
        :label="item.energyName"
        :name="item.energyCode"
        v-for="item in priceAdjustmentList"
        :key="item.energyCode"
      >
        <template v-if="item.energyCode === currentCode">
          <!-- 调整方式 -->
          <div class="pupa-item pupa-item-way">
            <label>调整方式</label>
            <te-select
              v-model="item.adjustType"
              placeholder="请选择"
              @change="handleAdjustTypeChange($event, item)"
              :disabled="props.disabledFlag"
            >
              <te-option
                v-for="adjust in adjustmentTypes"
                :key="adjust.code"
                :value="adjust.code"
                :label="adjust.name"
              />
            </te-select>
          </div>
          <!-- 浮动区间 -->
          <div
            class="pupa-item pupa-item-section"
            v-if="mapAdjustmentWaySelected(item.adjustType) && mapIsMonthDisabled(item.adjustType as any)"
          >
            <label>浮动区间</label>
            <te-input
              :class="{ empty: item.lower === '' }"
              v-model="item.lower"
              v-inputFilter:number="{
                decimal: 10,
                negative: false,
              }"
              @blur="handleValueChange"
              :disabled="props.disabledFlag"
            >
              <template #suffix>
                <span>元</span>
              </template>
            </te-input>
            <em>~</em>
            <te-input
              :class="{ empty: item.upper === '' }"
              v-model="item.upper"
              v-inputFilter:number="{
                decimal: 10,
                negative: false,
              }"
              :disabled="props.disabledFlag"
              @blur="handleValueChange"
            >
              <template #suffix>
                <span>元</span>
              </template>
            </te-input>
          </div>
          <!-- 调整时间 -->
          <div class="pupa-item" v-if="mapAdjustmentWaySelected(item.adjustType)">
            <label>调整时间</label>
            <te-radio-group v-model="item.adjustTimeType" @change="handleValueChange" :disabled="props.disabledFlag">
              <te-radio
                v-for="time in adjustTimeTypes"
                :disabled="mapIsMonthDisabled(item.adjustType as any) && mapIsMonthAdjust(time.code as any)"
                :key="time.code"
                :label="time.code"
              >
                {{ time.name }}
              </te-radio>
            </te-radio-group>
          </div>
          <!-- 单价类型 -->
          <div class="pupa-item pupa-item-price" v-if="mapAdjustmentWaySelected(item.adjustType)">
            <label>单价类型</label>
            <te-select
              :class="{ empty: !item.priceType }"
              v-model="item.priceType"
              placeholder="请选择"
              :disabled="props.disabledFlag"
              @change="handleValueChange"
            >
              <te-option
                v-for="price in mapPriceTypeList(item.adjustType)"
                :key="price.code"
                :value="price.code"
                :label="price.name"
              />
            </te-select>
            <label>{{ !mapIsCustomPrice(item.priceType) ? '保留小数' : '单价' }}</label>
            <!-- 小数位 -->
            <te-input
              v-model="item.decimalPoint"
              :disabled="props.disabledFlag"
              v-show="!mapIsCustomPrice(item.priceType)"
              v-inputFilter:positiveNumber="{ integral: 1, positiveInteger: false, maxValue: 4 }"
              @blur="handleValueChange"
            >
              <template #suffix>
                <span>位</span>
              </template>
            </te-input>
            <!-- 自定义单价 -->
            <te-input
              :class="{ empty: item.customPrice === '' }"
              :disabled="props.disabledFlag"
              class="pupa-item-price-input"
              v-model="item.customPrice"
              v-show="mapIsCustomPrice(item.priceType)"
              v-inputFilter:number="{ negative: false }"
              @blur="handleValueChange"
            >
              <template #suffix>
                <span>元</span>
              </template>
            </te-input>
          </div>
          <!-- 调整基数 -->
          <div class="pupa-item" v-if="mapAdjustmentWaySelected(item.adjustType)">
            <label>调整基数</label>
            <te-radio-group
              v-model="item.adjustCardinalityType"
              @change="handleValueChange"
              :disabled="props.disabledFlag"
            >
              <te-radio v-for="basis in adjustCardinalityTypes" :key="basis.code" :label="basis.code">
                {{ basis.name }}
              </te-radio>
            </te-radio-group>
          </div>
        </template>
      </te-tab-pane>
    </te-tabs>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { PropType, ref, watch, onMounted } from 'vue';
import { cloneDeep } from 'lodash';
// api
import { Pupa_IEnergyPriceAdjustmentVO } from './pae-unit-price-adjustment.api';
import { CommonICodeName } from '@/service/api/index';
import { PM_IContractPriceAdjust } from '../../pm-add-editor.api';
import { EnergyCode } from '@/pages/project-manage/services/project-manage.api';
// 枚举
import {
  PM_EPriceAdjustmentType,
  PM_EAdjustmentTime,
  PM_EAdjustmentBasis,
  PM_EPriceType,
} from '../../../constant/enum';
// 工具方法
import { checkExist, mapEnumToArray } from '../../utils';

// emits
const emits = defineEmits(['update:priceAdjustmentType']);
// props
const props = defineProps({
  // 数据源
  priceAdjustmentType: {
    type: Array as PropType<PM_IContractPriceAdjust[]>,
    default: [],
  },
  // 勾选的能源类型
  selectedEnergyList: {
    type: Array as PropType<string[]>,
    default: [],
  },
  // 全量能源类型列表
  energyCodeList: {
    type: Array as PropType<EnergyCode[]>,
    default: [],
  },
  // code-name Map
  energyCodeNameMap: {
    type: Object,
  },
  // 是否禁用
  disabledFlag: {
    type: Boolean,
    default: false,
  },
  // 空数据
  emptyFlag: {
    type: Boolean,
    default: false,
  },
});

// 调整方式
const adjustmentTypes: CommonICodeName<number>[] = Object.entries(PM_EPriceAdjustmentType)
  .filter(([k, v]) => typeof v === 'number')
  ?.map(([k, v]) => {
    return {
      code: +v,
      name: k,
    };
  });
// 调整时间
const adjustTimeTypes: CommonICodeName<number>[] = Object.entries(PM_EAdjustmentTime)
  .filter(([k, v]) => typeof v === 'number')
  ?.map(([k, v]) => {
    return {
      code: +v,
      name: k,
    };
  });
// 单价类型
const priceTypes: CommonICodeName<number>[] = Object.entries(PM_EPriceType)
  .filter(([k, v]) => typeof v === 'number')
  ?.map(([k, v]) => {
    return {
      code: +v,
      name: k,
    };
  });
/**
 * 浮动区间内不调，超出区间外的部分调整、浮动区间内不调，超出合同单价全调类型下，过滤当月实际单价
 * @param adjustType
 */
const mapPriceTypeList = (adjustType: PM_EPriceAdjustmentType | null) => {
  return adjustType !== null && mapIsMonthDisabled(adjustType)
    ? priceTypes.filter((item) => item.code !== PM_EPriceType.当月实际单价)
    : priceTypes;
};
// 调整基数
const adjustCardinalityTypes: CommonICodeName<number>[] = Object.entries(PM_EAdjustmentBasis)
  .filter(([k, v]) => typeof v === 'number')
  ?.map(([k, v]) => {
    return {
      code: +v,
      name: k,
    };
  });
/**
 * 判断是否勾选了调整方式,勾选的是否是无限风险
 * @param {number} adjustType
 * @returns {boolean}
 */
const mapAdjustmentWaySelected = (adjustType: number | null): boolean => {
  return !!adjustType && adjustType !== PM_EPriceAdjustmentType.无限风险;
};
/**
 * 判断是否是自定义单价
 * @param {string} priceType
 * @returns {boolean}
 */
const mapIsCustomPrice = (priceType: number | null): boolean => {
  return PM_EPriceType.自定义单价 === priceType;
};

/**
 * 是否不可选月度调整
 * @param {PM_EPriceAdjustmentType} type
 * @returns {boolean}
 */
const mapIsMonthDisabled = (type: PM_EPriceAdjustmentType): boolean => {
  return [
    PM_EPriceAdjustmentType['浮动区间内不调，超出合同单价全调'],
    PM_EPriceAdjustmentType['浮动区间内不调，超出区间外的部分调整'],
  ].includes(type);
};
/**
 * 判断是否是月度调整
 * @returns {boolean}
 */
const mapIsMonthAdjust = (type: PM_EAdjustmentTime): boolean => {
  return PM_EAdjustmentTime.月度调整 === type;
};
/**
 * 切换调整类型
 * @returns {void}
 */
const handleAdjustTypeChange = (type: PM_EPriceAdjustmentType, item: Pupa_IEnergyPriceAdjustmentVO): void => {
  if (mapIsMonthDisabled(type)) {
    item.adjustTimeType = PM_EAdjustmentTime.年度调整;

    if (item.priceType !== null && item.priceType === PM_EPriceType.当月实际单价) {
      item.priceType = null;
    }
  }

  handleValueChange();
};
/**
 * 修改值
 * @returns {void}
 */
const handleValueChange = (): void => {
  const list = priceAdjustmentList.value?.map((item) => ({
    energyCode: item?.energyCode,
    adjustType: item?.adjustType ?? null,
    lower: item?.adjustType === PM_EPriceAdjustmentType.无限风险 ? '' : item?.lower,
    upper: item?.adjustType === PM_EPriceAdjustmentType.无限风险 ? '' : item?.upper,
    adjustTimeType: item?.adjustType === PM_EPriceAdjustmentType.无限风险 ? null : item?.adjustTimeType,
    priceType: item?.adjustType === PM_EPriceAdjustmentType.无限风险 ? null : item?.priceType,
    customPrice: item?.adjustType === PM_EPriceAdjustmentType.无限风险 ? '' : item?.customPrice,
    decimalPoint: item?.adjustType === PM_EPriceAdjustmentType.无限风险 ? '' : item?.decimalPoint,
    adjustCardinalityType: item?.adjustType === PM_EPriceAdjustmentType.无限风险 ? null : item?.adjustCardinalityType,
  }));
  emits('update:priceAdjustmentType', list);
};
// 列表
const priceAdjustmentList = ref<Pupa_IEnergyPriceAdjustmentVO[]>([]);
// 当前能源类型
const currentCode = ref<string>(props?.priceAdjustmentType?.[0]?.energyCode ?? '01000');
// 监听能源类型勾选修改
watch(
  () => props.selectedEnergyList,
  (newVal) => {
    const cloneList: Pupa_IEnergyPriceAdjustmentVO[] = [];
    newVal.forEach((item) => {
      const index = priceAdjustmentList.value?.findIndex((cItem) => item === cItem.energyCode);
      if (index !== -1) {
        cloneList.push(priceAdjustmentList.value[index]);
      } else {
        cloneList.push({
          energyCode: item,
          energyName: (props.energyCodeNameMap as Map<string, string>).get(item) ?? '',
          adjustType: null,
          lower: '',
          upper: '',
          adjustTimeType: null,
          priceType: null,
          customPrice: '',
          decimalPoint: '',
          adjustCardinalityType: null,
        });
      }
    });
    priceAdjustmentList.value = cloneDeep(cloneList);
    // 处理默认选中,如果默认勾选的能源类型被移除了，则默认选中第一个
    if (!props.selectedEnergyList?.includes(currentCode.value)) {
      currentCode.value = priceAdjustmentList.value?.[0]?.energyCode;
    }
    // 按照能源类型排序
    priceAdjustmentList.value = priceAdjustmentList.value?.sort(
      (a, b) =>
        props.energyCodeList?.findIndex((item) => item.code === a.energyCode) -
        props.energyCodeList?.findIndex((item) => item.code === b.energyCode),
    );
    // 更新父组件数据
    handleValueChange();
  },
);

/**
 * 初始化
 */
onMounted(() => {
  props.priceAdjustmentType?.forEach((item) => {
    priceAdjustmentList.value.push({
      energyCode: item.energyCode,
      energyName: (props.energyCodeNameMap as Map<string, string>).get(item.energyCode) ?? '',
      adjustType: checkExist(item.adjustType, mapEnumToArray(PM_EPriceAdjustmentType)),
      upper: item.upper,
      lower: item.lower,
      adjustTimeType: checkExist(item.adjustTimeType, mapEnumToArray(PM_EAdjustmentTime)),
      priceType: checkExist(item.priceType, mapEnumToArray(PM_EPriceType)),
      customPrice: item.customPrice,
      decimalPoint: item.decimalPoint,
      adjustCardinalityType: checkExist(item.adjustCardinalityType, mapEnumToArray(PM_EAdjustmentBasis)),
    });
  });
});
</script>
<style lang="less" scoped>
.pae-unit-price-adjustment {
  :deep(.te-tabs) {
    width: 100%;

    &.pupa-empty {
      .te-tabs__header {
        border: none;
      }

      .te-input.is-disabled .te-input__inner[disabled] {
        background-color: transparent;
      }
    }
  }

  .pupa-item {
    display: flex;
    align-items: center;
    margin-bottom: var(--te-space-12);

    &:last-child {
      margin-bottom: 0;
    }

    > label {
      line-height: var(--te-space-32);
      margin-right: var(--te-space-12);
    }

    &.pupa-item-section {
      :deep(.te-input) {
        flex: auto;
      }

      em {
        margin: 0 5px;
      }
    }

    &.pupa-item-way {
      :deep(.te-select) {
        flex: auto;
      }
    }

    &.pupa-item-price {
      :deep(.te-select) {
        flex: auto;
        margin-right: var(--te-space-12);
      }

      > :deep(.te-input) {
        min-width: 56px;
        max-width: 56px;

        &.pupa-item-price-input {
          min-width: 84px;
          max-width: 84px;
        }
      }
    }
  }
}
</style>
