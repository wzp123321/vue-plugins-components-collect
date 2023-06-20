<template>
  <div class="year-range-picker can-clear" id="year-range-picker">
    <el-popover
      :teleported="false"
      placement="bottom"
      :showArrow="false"
      :width="DEFAULT_WIDTH"
      trigger="click"
      @show="handleShow"
    >
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

      <!-- header -->
      <div class="yrp-panel" :style="{ height: `${DEFAULT_HEIGHT}px` }">
        <div class="yrp-panel-header">
          <div class="start-scope">
            <i class="ems-iconfont"></i>
            <span>2222</span>
            <i class="ems-iconfont"></i>
          </div>
          <div class="end-scope">
            <i class="ems-iconfont"></i>
            <span>2222</span>
            <i class="ems-iconfont"></i>
          </div>
        </div>
        <div class="yrp-panel-body">
          <!-- 左 -->
          <ul class="yrp-panel-table left-table">
            <li
              v-for="(item, index) in leftTableList"
              :key="index"
              :class="{
                'yrp-panel-table-td': true,
                'out-view': item.isOutOfView,
                'start-date': item.isStart,
                'end-date': item.isEnd,
                'in-range': item.isInRange,
              }"
            >
              <span class="date-label" :title="item.value + ''">{{ item.value }}</span>
            </li>
          </ul>
          <!-- 右 -->
          <ul class="yrp-panel-table right-table">
            <li
              v-for="(item, index) in rightTableList"
              :key="index"
              :class="{
                'yrp-panel-table-td': true,
                'out-view': item.isOutOfView,
                'start-date': item.isStart,
                'end-date': item.isEnd,
                'in-range': item.isInRange,
              }"
            >
              <span class="date-label" :title="item.value + ''">{{ item.value }}</span>
            </li>
          </ul>
        </div>
      </div>
    </el-popover>
    <i class="ems-iconfont icon-qingkong" @click="handleClear"></i>
  </div>
</template>
<script lang="ts" setup name="YearRangePicker">
import { onMounted, PropType, ref, watch } from 'vue';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT, YRP_IYearVO, YRP_EPosition } from './year-range-picker.api';

const emits = defineEmits(['update:modelValue', 'change']);
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
  console.log(sYear);
  minYear.value = sYear === 0 ? cYear - (cYear % 10) - 1 : sYear - (sYear % 10) - 1;
}
/**
 * 生成左右两侧表格
 * @param minYearValue
 * @param position
 */
function initYearTableList(minYearValue: number, position: YRP_EPosition) {
  const cYear = new Date().getFullYear();
  let list: YRP_IYearVO[] = [];
  const sYear = props?.modelValue?.length === 2 ? props?.modelValue?.[0]?.getFullYear() : 0;
  const eYear = props?.modelValue?.length === 2 ? props?.modelValue?.[1]?.getFullYear() : 0;
  for (let i = minYearValue; i < minYearValue + 12; i++) {
    const isOutOfView =
      (position === YRP_EPosition.左 && (i === minYear.value || i === minYear.value + 12 - 1)) ||
      (position === YRP_EPosition.右 && (i === minYear.value + 10 || i === minYear.value + 10 + 12 - 1));
    list.push({
      value: i,
      isToday: cYear === i,
      isStart: sYear === i && !isOutOfView,
      isEnd: eYear === i && !isOutOfView,
      isInRange: props?.modelValue?.length === 2 && i >= sYear && i <= eYear,
      isDisabled: props?.disabledDate ? props?.disabledDate(new Date(i)) : false,
      isOutOfView,
    });
  }
  return list;
}
function initInputValue() {
  leftValue.value = '';
  rightValue.value = '';
  if (props.modelValue?.length) {
    leftValue.value = props.modelValue?.[0]?.getFullYear() + '';
    rightValue.value = props.modelValue?.[1]?.getFullYear() + '';
  }
}
// 清空
function handleClear() {
  leftValue.value = '';
  rightValue.value = '';
  leftTableList.value = [];
  rightTableList.value = [];
  emits('update:modelValue', []);
  emits('change', []);
}
/**
 * 打开弹出层
 */
function handleShow() {
  initMinYear();
  leftTableList.value = initYearTableList(minYear.value, YRP_EPosition.左);
  rightTableList.value = initYearTableList(minYear.value + 10, YRP_EPosition.右);
}
watch(
  () => props.modelValue,
  () => {
    initInputValue();
  },
  {
    immediate: true,
  },
);
onMounted(() => {
  // console.log('onMounted---props.modelValue-----------', props.modelValue);
  // initMinYear();
  // leftTableList.value = initYearTableList(minYear.value, YRP_EPosition.左);
  // rightTableList.value = initYearTableList(minYear.value + 10, YRP_EPosition.右);
  // console.log('minYear.value --------------------', minYear.value);
  // console.log('leftTableList.value --------------------', leftTableList.value);
  // console.log('rightTableList.value --------------------', rightTableList.value);
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

  :deep(.el-popper) {
    padding: 0 !important;

    .yrp-panel {
      display: flex;
      flex-direction: column;

      .yrp-panel-header {
        padding: 9px 16px 8px;
        display: flex;
        border-bottom: 1px solid var(--color-text-divider);

        .start-scope,
        .end-scope {
          flex: auto;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;

          color: var(--color-text-title);
        }
      }

      .yrp-panel-body {
        display: flex;
        flex-direction: row;

        ul.yrp-panel-table {
          padding: 32px;
          margin-bottom: 0;
          flex: auto;
          height: 100%;

          display: flex;
          flex-wrap: wrap;
          row-gap: 32px;

          li {
            cursor: pointer;
            display: inline-block;
            padding: 0 16px 0 15px;

            .date-label {
              display: inline-block;
              padding: 1px 8px;
              color: var(--color-text-primary);
            }

            &:nth-child(3n + 1) {
              padding-left: 0;
            }

            &:nth-child(3n) {
              padding-right: 0;
            }
          }

          li:not(.in-range):not(.out-view):not(.start-date):not(.end-date):hover > span {
            background-color: var(--color-active);
          }

          li.yrp-panel-table-td {
            > span {
              color: var(--color-text-primary);
            }

            &.in-range:not(.out-view) {
              background-color: var(--color-active);
            }

            &.start-date {
              padding-left: 0;
              margin-right: 16px;
              border-top-left-radius: 3px;
              border-bottom-left-radius: 3px;

              > span {
                border-top-left-radius: 3px;
                border-bottom-left-radius: 3px;
              }
            }

            &.end-date {
              padding-right: 0;
              margin-right: 16px;

              border-top-right-radius: 3px;
              border-bottom-right-radius: 3px;

              > span {
                border-top-right-radius: 3px;
                border-bottom-right-radius: 3px;
              }
            }

            &.start-date,
            &.end-date {
              background-color: var(--color-active);

              > span {
                color: var(--color-default);
                background-color: var(--color-primary);
              }
            }

            &.out-view > span {
              color: var(--color-text-disable);
            }
          }
        }
      }
    }
  }
}
</style>
