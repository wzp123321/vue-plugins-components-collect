<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">DatetimePicker 日期时间选择器</text>
      </view>

      <view class="demo-card">
        <text class="section-title">基础用法（日期）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayMap.date || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openPicker('date')">选择日期</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">有默认值（年月日）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayMap.defaultDate || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openPicker('defaultDate')">选择日期</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">范围选择（日期）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ rangeDisplay || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openRangePicker">选择日期范围</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">范围选择有默认值（年月日）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ rangeDefaultDisplay || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openRangeDefaultPicker">选择日期范围</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">限制最大最小日期</text>
        <view class="demo-row">
          <view class="demo-row__label">限制范围</view>
          <view class="demo-row__value">2024-01-01 ~ 2026-12-31</view>
        </view>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayMap.minMaxDate || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openPicker('minMaxDate')">选择日期</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">范围选择限制最大最小日期</text>
        <view class="demo-row">
          <view class="demo-row__label">限制范围</view>
          <view class="demo-row__value">2024-06-01 ~ 2026-06-30</view>
        </view>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ rangeMinMaxDisplay || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openRangeMinMaxPicker">选择日期范围</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">月份选择（年、月）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayMap.month || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openPicker('month')">选择月份</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">年份选择（年）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayMap.year || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openPicker('year')">选择年份</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">小时选择（时）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayMap.hour || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openPicker('hour')">选择小时</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">分钟选择（时、分）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayMap.minute || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openPicker('minute')">选择分钟</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">秒选择（时、分、秒）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayMap.second || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openPicker('second')">选择秒</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">日期时间（年、月、日、时）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayMap['date-hour'] || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openPicker('date-hour')">选择日期小时</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">日期时间（年、月、日、时、分）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayMap['date-minute'] || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openPicker('date-minute')">选择日期时间</tsm-button>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">完整时间（年、月、日、时、分、秒）</text>
        <view class="demo-row">
          <view class="demo-row__label">当前选择</view>
          <view class="demo-row__value">{{ displayMap['date-second'] || '未选择' }}</view>
        </view>
        <view class="demo-actions">
          <tsm-button theme="primary" @click="openPicker('date-second')">选择完整时间</tsm-button>
        </view>
      </view>

      <tsm-datetime-picker
        v-for="mode in modes"
        :key="mode"
        :mode="pickerModeMap[mode]"
        :show="showMap[mode]"
        :value="valueMap[mode]"
        :min-date="minMaxDateModeMap.minDate"
        :max-date="minMaxDateModeMap.maxDate"
        @confirm="value => onConfirm(mode, value)"
        @close="closePicker(mode)"
        @update:value="value => onUpdate(mode, value)"
      />

      <tsm-datetime-picker
        mode="date"
        range
        :show="showRange"
        :value="rangeValue"
        @confirm="onRangeConfirm"
        @close="closeRangePicker"
        @update:value="onRangeUpdate"
      />

      <tsm-datetime-picker
        mode="date"
        range
        :show="showRangeDefault"
        :value="rangeDefaultValue"
        @confirm="onRangeDefaultConfirm"
        @close="closeRangeDefaultPicker"
        @update:value="onRangeDefaultUpdate"
      />

      <tsm-datetime-picker
        mode="date"
        range
        :show="showRangeMinMax"
        :value="rangeMinMaxValue"
        :min-date="rangeMinDate"
        :max-date="rangeMaxDate"
        @confirm="onRangeMinMaxConfirm"
        @close="closeRangeMinMaxPicker"
        @update:value="onRangeMinMaxUpdate"
      />
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { DatetimePickerMode } from '@/uni_modules/@tiansu/ts-mobile-ui/components/ui/components/tsm-datetime-picker/uniapp/props';

type DateValue = string | number | [string | number, string | number];
type DemoModeKey =
  | 'date'
  | 'defaultDate'
  | 'minMaxDate'
  | 'month'
  | 'year'
  | 'hour'
  | 'minute'
  | 'second'
  | 'date-hour'
  | 'date-minute'
  | 'date-second';

const modes: DemoModeKey[] = [
  'date',
  'defaultDate',
  'minMaxDate',
  'month',
  'year',
  'hour',
  'minute',
  'second',
  'date-hour',
  'date-minute',
  'date-second',
];

const pickerModeMap: Record<DemoModeKey, DatetimePickerMode> = {
  date: 'date',
  defaultDate: 'date',
  minMaxDate: 'date',
  month: 'month',
  year: 'year',
  hour: 'hour',
  minute: 'minute',
  second: 'second',
  'date-hour': 'date-hour',
  'date-minute': 'date-minute',
  'date-second': 'date-second',
};

const showMap = ref<Record<string, boolean>>({
  date: false,
  defaultDate: false,
  minMaxDate: false,
  month: false,
  year: false,
  hour: false,
  minute: false,
  second: false,
  'date-hour': false,
  'date-minute': false,
  'date-second': false,
});

const valueMap = ref<Record<string, string | number>>({
  date: '',
  defaultDate: Date.now(),
  minMaxDate: '',
  month: '',
  year: '',
  hour: '',
  minute: '',
  second: '',
  'date-hour': '',
  'date-minute': '',
  'date-second': '',
});

const displayMap = ref<Record<string, string>>({
  date: '',
  defaultDate: '',
  minMaxDate: '',
  month: '',
  year: '',
  hour: '',
  minute: '',
  second: '',
  'date-hour': '',
  'date-minute': '',
  'date-second': '',
});

const minMaxDateModeMap = ref({
  minDate: new Date('2024-01-01').getTime(),
  maxDate: new Date('2026-12-31').getTime(),
});

const showRange = ref(false);
const rangeValue = ref<[string | number, string | number]>(['', '']);
const rangeDisplay = ref('');

const showRangeDefault = ref(false);
const rangeDefaultValue = ref<[string | number, string | number]>([
  new Date('2025-01-01').getTime(),
  new Date('2025-01-15').getTime(),
]);
const rangeDefaultDisplay = ref('');

const showRangeMinMax = ref(false);
const rangeMinMaxValue = ref<[string | number, string | number]>([
  new Date('2025-03-01').getTime(),
  new Date('2025-03-15').getTime(),
]);
const rangeMinMaxDisplay = ref('');
const rangeMinDate = ref(new Date('2024-06-01').getTime());
const rangeMaxDate = ref(new Date('2026-06-30').getTime());

const openPicker = (mode: string) => {
  showMap.value[mode] = true;
};

const closePicker = (mode: string) => {
  showMap.value[mode] = false;
};

const openRangePicker = () => {
  showRange.value = true;
};

const closeRangePicker = () => {
  showRange.value = false;
};

const openRangeDefaultPicker = () => {
  showRangeDefault.value = true;
};

const closeRangeDefaultPicker = () => {
  showRangeDefault.value = false;
};

const openRangeMinMaxPicker = () => {
  showRangeMinMax.value = true;
};

const closeRangeMinMaxPicker = () => {
  showRangeMinMax.value = false;
};

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatTime = (date: Date) => {
  const h = `${date.getHours()}`.padStart(2, '0');
  const m = `${date.getMinutes()}`.padStart(2, '0');
  return `${h}:${m}`;
};

const formatSecond = (date: Date) => {
  const h = `${date.getHours()}`.padStart(2, '0');
  const m = `${date.getMinutes()}`.padStart(2, '0');
  const s = `${date.getSeconds()}`.padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const formatByMode = (mode: DatetimePickerMode, value: Date) => {
  switch (mode) {
    case 'date':
      return formatDate(value);
    case 'month':
      return `${value.getFullYear()}-${`${value.getMonth() + 1}`.padStart(2, '0')}`;
    case 'year':
      return `${value.getFullYear()}`;
    case 'hour':
      return `${`${value.getHours()}`.padStart(2, '0')}时`;
    case 'minute':
      return formatTime(value);
    case 'second':
      return formatSecond(value);
    case 'date-hour':
      return `${formatDate(value)} ${`${value.getHours()}`.padStart(2, '0')}时`;
    case 'date-minute':
      return `${formatDate(value)} ${formatTime(value)}`;
    case 'date-second':
      return `${formatDate(value)} ${formatSecond(value)}`;
    default:
      return formatDate(value);
  }
};

const syncDefaultDisplays = () => {
  const defaultDateValue = valueMap.value.defaultDate;
  if (typeof defaultDateValue === 'number') {
    displayMap.value.defaultDate = formatByMode(pickerModeMap.defaultDate, new Date(defaultDateValue));
  }

  const rangeDefaultStart = rangeDefaultValue.value[0];
  const rangeDefaultEnd = rangeDefaultValue.value[1];
  if (
    (typeof rangeDefaultStart === 'number' || typeof rangeDefaultStart === 'string') &&
    (typeof rangeDefaultEnd === 'number' || typeof rangeDefaultEnd === 'string')
  ) {
    const start = new Date(Number(rangeDefaultStart));
    const end = new Date(Number(rangeDefaultEnd));
    rangeDefaultDisplay.value = `${formatDate(start)} ~ ${formatDate(end)}`;
  }

  const rangeMinMaxStart = rangeMinMaxValue.value[0];
  const rangeMinMaxEnd = rangeMinMaxValue.value[1];
  if (
    (typeof rangeMinMaxStart === 'number' || typeof rangeMinMaxStart === 'string') &&
    (typeof rangeMinMaxEnd === 'number' || typeof rangeMinMaxEnd === 'string')
  ) {
    const start = new Date(Number(rangeMinMaxStart));
    const end = new Date(Number(rangeMinMaxEnd));
    rangeMinMaxDisplay.value = `${formatDate(start)} ~ ${formatDate(end)}`;
  }
};

syncDefaultDisplays();

const onUpdate = (mode: string, value: DateValue) => {
  if (typeof value === 'number') {
    valueMap.value[mode] = value;
    return;
  }
  if (typeof value === 'string') {
    valueMap.value[mode] = value;
  }
};

const onConfirm = (mode: string, value: DateValue) => {
  if (typeof value === 'number' || (typeof value === 'string' && value !== '')) {
    const date = new Date(Number(value));
    displayMap.value[mode] = formatByMode(mode as DatetimePickerMode, date);
  }
  closePicker(mode);
};

const onRangeUpdate = (value: DateValue) => {
  if (Array.isArray(value)) {
    rangeValue.value = value;
  }
};

const onRangeConfirm = (value: DateValue) => {
  if (Array.isArray(value)) {
    const start = new Date(Number(value[0]));
    const end = new Date(Number(value[1]));
    rangeDisplay.value = `${formatDate(start)} ~ ${formatDate(end)}`;
  }
  closeRangePicker();
};

const onRangeDefaultUpdate = (value: DateValue) => {
  if (Array.isArray(value)) {
    rangeDefaultValue.value = value;
  }
};

const onRangeDefaultConfirm = (value: DateValue) => {
  if (Array.isArray(value)) {
    const start = new Date(Number(value[0]));
    const end = new Date(Number(value[1]));
    rangeDefaultDisplay.value = `${formatDate(start)} ~ ${formatDate(end)}`;
  }
  closeRangeDefaultPicker();
};

const onRangeMinMaxUpdate = (value: DateValue) => {
  if (Array.isArray(value)) {
    rangeMinMaxValue.value = value;
  }
};

const onRangeMinMaxConfirm = (value: DateValue) => {
  if (Array.isArray(value)) {
    const start = new Date(Number(value[0]));
    const end = new Date(Number(value[1]));
    rangeMinMaxDisplay.value = `${formatDate(start)} ~ ${formatDate(end)}`;
  }
  closeRangeMinMaxPicker();
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 12px;
  background: #f7f8fa;
  height: 100%;
  box-sizing: border-box;
}

.header {
  padding: 10px 10px 4px;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px 12px 12px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #111827;
}

.demo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.demo-row__label {
  font-size: 14px;
  color: #6b7280;
}

.demo-row__value {
  font-size: 14px;
  color: #111827;
}

.demo-actions {
  margin-top: 2px;
}
</style>
