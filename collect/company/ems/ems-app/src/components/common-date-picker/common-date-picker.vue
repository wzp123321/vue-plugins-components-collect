<template>
  <view class="common-date-picker">
    <uni-dateformat :date="props.date" :format="mapTimeUnitFormat(props.fields)" @click="open"></uni-dateformat>
    <uni-popup ref="popupRef" type="bottom">
      <view class="cdp-popup">
        <!-- 头部 -->
        <view class="cdp-popup-header">
          <text class="cdp-popup-header-cancel" @click="cancel">取消</text>
          <text class="cdp-popup-header-title">选择日期</text>
          <text class="cdp-popup-header-submit" @click="handleSubmit">确定</text>
        </view>
        <picker-view class="cdp-popup-body" :value="state.valueArray" @change="handleChange">
          <picker-view-column v-for="(item, index) in rangeArray" :key="index" :value="state.valueArray">
            <div v-for="(childItem, childIndex) in item" :key="childIndex" class="cdp-popup-body-item">
              {{ _l10nItem(childItem, index) }}
            </div>
          </picker-view-column>
        </picker-view>
      </view>
    </uni-popup>
  </view>
</template>
<script lang="ts" setup>
import { mapTimeUnitFormat } from '@/utils';
// 枚举
import { computed, reactive, ref, watch } from 'vue';
import { fields, type State, type ThreeDimensionArray } from './common-date-picker.api';
import { _l10nColumn, getDefaultEndValue, getDefaultStartValue, getYearStartEnd } from './index';
import { formatDateTime } from '@dcloudio/uni-shared';

// emits
const emits = defineEmits(['change']);
const props = defineProps({
  // 日期
  date: {
    type: String,
    default: '',
  },
  // 类型
  fields: {
    type: String,
    default: '1',
  },
  start: {
    type: String,
    default: (props: any) => {
      return getDefaultStartValue(props.fields);
    },
  },
  end: {
    type: String,
    default: (props: any) => {
      return getDefaultEndValue(props.fields);
    },
  },
});

const state: State = reactive({
  valueSync: undefined,
  visible: false,
  contentVisible: false,
  popover: null,
  valueChangeSource: '',
  timeArray: [],
  dateArray: [],
  valueArray: [],
  oldValueArray: [],
});
function _createDate() {
  let years: string[] = [];

  const year = getYearStartEnd(props.start, props.end);
  for (let i = year.start, end = year.end; i <= end; i++) {
    years.push(String(i));
  }
  let months: string[] = [];
  for (let i = 1; i <= 12; i++) {
    months.push((i < 10 ? '0' : '') + i);
  }
  let days: string[] = [];
  for (let i = 1; i <= 31; i++) {
    days.push((i < 10 ? '0' : '') + i);
  }
  (state.dateArray as ThreeDimensionArray).push(years, months, days);
}
/**
 * 年月日列表
 */
const rangeArray = computed(() => {
  const dateArray = state.dateArray;
  switch (props.fields) {
    case fields.YEAR:
      return [dateArray[0]];
    case fields.MONTH:
      return [dateArray[0], dateArray[1]];
    default:
      return [dateArray[0], dateArray[1], dateArray[2]];
  }
});
function _l10nItem(item: string | number, index: number) {
  const array = ['年', '月', '日'];
  return item + array[index];
}
function _setValueSync() {
  let val = props.date;

  state.valueSync = String(val);
}
function _setValueArray() {
  let val = state.valueSync;
  let valueArray;

  valueArray = getDateValueArray(
    state,
    val as string,
    formatDateTime({
      mode: 'date',
    }),
  );
  console.log('valueArray', valueArray);

  state.oldValueArray = [...valueArray] as number[];
  state.valueArray = [...valueArray] as number[];
}
function getDateValueArray(state: State, valueStr?: string, defaultValue?: string): number[] {
  const splitStr = '-';
  const array = state.dateArray;
  let max;

  switch (props.fields) {
    case fields.YEAR:
      max = 1;
      break;
    case fields.MONTH:
      max = 2;
      break;
    default:
      max = 3;
      break;
  }
  const inputArray = String(valueStr).split(splitStr);
  let value = [];
  for (let i = 0; i < max; i++) {
    const val = inputArray[i];
    value.push(array[i].indexOf(val));
  }
  if (value.indexOf(-1) >= 0) {
    value = defaultValue ? getDateValueArray(state, defaultValue) : value.map(() => 0);
  }
  console.log('value----------------', valueStr, value);
  return value;
}

// 弹出框
const popupRef = ref();

/**
 * 打开
 */
const open = () => {
  _createDate();
  _setValueSync();
  _setValueArray();
  popupRef.value && popupRef.value?.open('bottom');
};
const cancel = () => {
  popupRef.value && popupRef.value?.close();
};
watch(() => state.valueSync, _setValueArray, { deep: true });

/**
 * 切换
 * @param value
 */
const handleChange = (event: { detail: { value: number[] } }) => {
  state.valueArray = event.detail.value;
};
/**
 * 生成日期
 */
function _getValue() {
  return state.valueArray.map((val, i) => state.dateArray[i][val]).join('-');
}
/**
 * 确认
 */
const handleSubmit = () => {
  emits('change', {
    detail: {
      value: _getValue(),
    },
  });
  cancel();
};
</script>
<style lang="scss" scoped>
.common-date-picker {
  :deep(.uni-popup__wrapper.bottom) {
    height: 580rpx;
    background-color: var(--tem-color-white) !important;
    border-radius: 16rpx 16rpx 0 0;
    display: flex;
    flex-direction: column;

    .cdp-popup-header {
      padding: 32rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .cdp-popup-header-cancel,
      .cdp-popup-header-submit {
        font-size: var(--tem-font-size-b14);
        color: var(--tem-text-color-regular);
      }

      .cdp-popup-header-submit {
        color: var(--tem-color-primary);
      }

      .cdp-popup-header-title {
        color: var(--tem-text-color-primary);
        font-size: var(--tem-font-size-h18);
        font-weight: 600;
        line-height: 52rpx;
      }
    }

    .cdp-popup-body {
      position: relative;
      display: block;
      width: 100%;
      height: 238px;
      background-color: #fff;

      .uni-picker-view-wrapper {
        .uni-picker-view-content {
          .cdp-popup-body-item {
            text-align: center;
            padding: 0;
            height: 34px;
            line-height: 34px;
            text-align: center;
            color: #000;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            cursor: pointer;
          }

          .cdp-popup-body-item.is-selected {
            background-color: rgba(245, 247, 250, 1);
            color: var(--tem-text-color-regular);
          }
        }
      }
    }
  }
}
</style>
