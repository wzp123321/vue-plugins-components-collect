<template>
  <div class="year-range-picker can-clear" id="year-range-picker">
    <el-popover :teleported="false" placement="bottom" :showArrow="false" :width="DEFAULT_WIDTH" trigger="click">
      <template #reference>
        <div class="yrp-trigger">
          <div class="yrp-input start-year">
            <input type="text" size="12" :placeholder="props.placeholders[0]" autocomplete="off" :value="leftValue" />
          </div>
          <span class="yrp-separator">~</span>
          <div class="yrp-input start-year">
            <input type="text" size="12" :placeholder="props.placeholders[1]" autocomplete="off" :value="rightValue" />
          </div>
          <i class="ems-iconfont icon-rili1"></i>
        </div>
      </template>

      <!-- body -->
      <div class="yrp-panel">
        <!-- 左 -->
        <ul class="yrp-panel-table left-table">
          <li
            v-for="(item, index) in leftTableList"
            :key="index"
            :class="{ 'yrp-panel-table-td': true, 'out-view': item.isOutOfView }"
          >
            <span class="date-label" :title="item.value + ''">{{ item.value }}</span>
          </li>
        </ul>
        <!-- 右 -->
        <ul class="yrp-panel-table right-table">
          <li
            v-for="(item, index) in rightTableList"
            :key="index"
            :class="{ 'yrp-panel-table-td': true, 'out-view': item.isOutOfView }"
          >
            <span class="date-label" :title="item.value + ''">{{ item.value }}</span>
          </li>
        </ul>
      </div>
    </el-popover>
    <i class="ems-iconfont icon-qingkong" @click="handleClear"></i>
  </div>
</template>
<script lang="ts" setup name="YearRangePicker">
import { onMounted, PropType, ref } from 'vue';
import { DEFAULT_WIDTH, YRP_IYearVO, YRP_EPosition } from './year-range-picker.api';

const props = defineProps({
  modelValue: {
    type: Array as PropType<Date[]>,
    default: [],
  },
  placeholders: {
    type: Array as PropType<string[]>,
    default: ['请选择', '请选择'],
  },
  disabledDate: {
    type: Function as PropType<(value: Date) => boolean>,
  },
});
// 左右列表
const leftTableList = ref<YRP_IYearVO[]>([]);
const rightTableList = ref<YRP_IYearVO[]>([]);
const leftValue = ref<string>('2019');
const rightValue = ref<string>('2023');
/**
 * 用于计算两边表格数据，
 * minYear~(minYear+12-1)    (minYear+10)~(minYear+10+12-1)
 * 等于startYear减去小数位减1；eg：startYear=2003，minYear=2003-3-1=1999
 */
const minYear = ref<number>(0);
/**
 * 初始化最小年
 */
function initMinYear() {
  const cYear = new Date().getFullYear();
  const sYear = props?.modelValue?.length === 2 ? props?.modelValue?.[0]?.getFullYear() : 0;
  minYear.value = sYear === 0 ? cYear - (cYear % 10) - 1 : sYear - (sYear % 10) - 1;
}
function initYearTableList(minYearValue: number, position: YRP_EPosition) {
  const cYear = new Date().getFullYear();
  let list: YRP_IYearVO[] = [];
  const sYear = props?.modelValue?.length === 2 ? props?.modelValue?.[0]?.getFullYear() : 0;
  const eYear = props?.modelValue?.length === 2 ? props?.modelValue?.[1]?.getFullYear() : 0;
  for (let i = minYearValue; i < minYearValue + 12; i++) {
    list.push({
      value: i,
      isToday: cYear === i,
      isStart: sYear === i,
      isEnd: eYear === i,
      isInRange: props?.modelValue?.length === 2 && i >= sYear && i <= eYear,
      isDisabled: props?.disabledDate ? props?.disabledDate(new Date(i)) : false,
      isOutOfView:
        (position === YRP_EPosition.左 && (i === minYear.value || i === minYear.value + 12 - 1)) ||
        (position === YRP_EPosition.右 && (i === minYear.value + 10 || i === minYear.value + 10 + 12 - 1)),
    });
  }
  return list;
}

// 清空
function handleClear() {
  console.log('clear');
}
function mapDateSelected(value: number) {
  return (
    (leftValue.value !== '' && value === Number(leftValue.value)) ||
    (rightValue.value !== '' && value === Number(rightValue.value))
  );
}
onMounted(() => {
  initMinYear();
  leftTableList.value = initYearTableList(minYear.value, YRP_EPosition.左);
  rightTableList.value = initYearTableList(minYear.value + 10, YRP_EPosition.右);
  console.log('minYear.value --------------------', minYear.value);
  console.log('leftTableList.value --------------------', leftTableList.value);
  console.log('rightTableList.value --------------------', rightTableList.value);
});
</script>
<style lang="less" scoped>
#year-range-picker {
  position: relative;
  width: 360px;
  height: 36px;
  box-sizing: border-box;
  padding: 6px 11px;
  border: 1px solid var(--color-text-border);
  border-radius: 4px;

  .yrp-trigger {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;

    .yrp-input {
      flex: auto;
      height: 100%;

      input {
        height: 100%;
        line-height: 1.5715;
        border: none;
      }

      input:focus {
        box-shadow: none;
      }
    }

    .yrp-separator {
      padding: 0 8px;
      line-height: 1;
    }

    .ems-iconfont.icon-rili1 {
      font-size: 14px;
      margin-left: 4px;
      color: var(--color-text-primary);
      line-height: 1;
    }
  }

  .ems-iconfont.icon-qingkong {
    display: none;
    cursor: pointer;

    font-size: 14px;
    margin-left: 4px;
    color: var(--color-text-primary);
    line-height: 1;
    background-color: #fff;

    position: absolute;
    top: 50%;
    right: 11px;
    transform: translateY(-50%);
  }

  &.can-clear:hover {
    .ems-iconfont.icon-qingkong {
      display: inline-block;

      &:hover {
        color: var(--color-text-title);
      }
    }
  }

  .yrp-panel {
    display: flex;
    gap: 24px;

    ul.yrp-panel-table {
      flex: auto;
      height: 100%;

      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      li {
        cursor: pointer;
        display: inline-block;
        padding: 16px 0;

        .date-label {
          display: inline-block;
          padding: 0 20px;
          color: var(--color-text-primary);
        }
      }

      li.yrp-panel-table-td {
        > span {
          color: var(--color-text-primary);
        }
        &.out-view > span {
          color: var(--color-text-disable);
        }
      }
    }
  }
}
</style>
