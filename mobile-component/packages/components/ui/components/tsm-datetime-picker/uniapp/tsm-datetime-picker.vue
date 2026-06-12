<template>
  <!-- 底部弹出层容器，承载整个日期时间选择器 -->
  <tsm-popup
    mode="bottom"
    :title="displayTitle"
    :closeable="true"
    :show="props.show"
    :closeOnClickOverlay="true"
    :safeAreaInsetBottom="true"
    customClass="tsm-datetime-picker-popup"
    @update:show="onClose"
  >
    <!-- 选择器主体容器，应用 BEM 类名和自定义样式 -->
    <view class="tsm-datetime-picker" :class="bemClass">
      <!-- 范围选择模式下的 Tab 切换区域（开始时间 / 结束时间） -->
      <view v-if="props.range" class="tsm-datetime-picker-range-tabs">
        <view
          class="tsm-datetime-picker-range-tab"
          :class="{ 'tsm-datetime-picker-range-tab-active': activeRangeTab === RANGE_TAB.START }"
          @tap="onRangeTabChange(RANGE_TAB.START)"
        >
          开始时间
        </view>
        <view
          class="tsm-datetime-picker-range-tab"
          :class="{ 'tsm-datetime-picker-range-tab-active': activeRangeTab === RANGE_TAB.END }"
          @tap="onRangeTabChange(RANGE_TAB.END)"
        >
          结束时间
        </view>
      </view>

      <!--
        picker-view 的滚动吸附/居中逻辑以"选中框(uni-picker-view-indicator)"为基准。
        这里通过 indicator-style 设置选中框高度为 40px；picker-view-column 的子节点高度会自动跟随选中框高度。
        因此 item 的 height/line-height 也需保持 40px，避免只改 item 高度导致滚动后选中位置出现偏移。
      -->
      <picker-view
        class="tsm-datetime-picker-view"
        :value="pickerValue"
        indicator-style="height: 40px;"
        @change="onChange"
      >
        <!-- 年列：根据 mode 决定是否显示 -->
        <picker-view-column class="uni-picker-view-column" v-if="showYearColumn">
          <view
            v-for="year in years"
            :key="year"
            class="tsm-datetime-picker-item"
            :class="{ 'tsm-datetime-picker-item-active': year === activeParts.year }"
          >
            {{ year }}
          </view>
        </picker-view-column>
        <!-- 月列：根据 mode 决定是否显示 -->
        <picker-view-column class="uni-picker-view-column" v-if="showMonthColumn">
          <view
            v-for="month in months"
            :key="month"
            class="tsm-datetime-picker-item"
            :class="{ 'tsm-datetime-picker-item-active': month === activeParts.month }"
          >
            {{ formatTwoDigitLabel(month) }}
          </view>
        </picker-view-column>
        <!-- 日列：根据 mode 决定是否显示 -->
        <picker-view-column class="uni-picker-view-column" v-if="showDayColumn">
          <view
            v-for="day in days"
            :key="day"
            class="tsm-datetime-picker-item"
            :class="{ 'tsm-datetime-picker-item-active': day === activeParts.day }"
          >
            {{ formatTwoDigitLabel(day) }}
          </view>
        </picker-view-column>
        <!-- 时列：根据 mode 决定是否显示 -->
        <picker-view-column class="uni-picker-view-column" v-if="showHourColumn">
          <view
            v-for="hour in hours"
            :key="hour"
            class="tsm-datetime-picker-item"
            :class="{ 'tsm-datetime-picker-item-active': hour === activeParts.hour }"
          >
            {{ formatHourLabel(hour) }}
          </view>
        </picker-view-column>
        <!-- 分列：根据 mode 决定是否显示 -->
        <picker-view-column class="uni-picker-view-column" v-if="showMinuteColumn">
          <view
            v-for="minute in minutes"
            :key="minute"
            class="tsm-datetime-picker-item"
            :class="{ 'tsm-datetime-picker-item-active': minute === activeParts.minute }"
          >
            {{ formatTwoDigitLabel(minute) }}
          </view>
        </picker-view-column>
        <!-- 秒列：根据 mode 决定是否显示 -->
        <picker-view-column class="uni-picker-view-column" v-if="showSecondColumn">
          <view
            v-for="second in seconds"
            :key="second"
            class="tsm-datetime-picker-item"
            :class="{ 'tsm-datetime-picker-item-active': second === activeParts.second }"
          >
            {{ formatTwoDigitLabel(second) }}
          </view>
        </picker-view-column>
      </picker-view>
    </view>
    <!-- 底部操作区：确认按钮 -->
    <template #footer>
      <view class="tsm-datetime-picker-footer">
        <tsm-button theme="primary" @tap="onConfirm">确定</tsm-button>
      </view>
    </template>
  </tsm-popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { DateValue, DatetimePickerProps, PickerChangeEvent, PickerColumns, RangeTab } from './props';
import {
  DATETIME_PICKER_MODE,
  DAY_COLUMN_MODES,
  defaultProps,
  HOUR_COLUMN_MODES,
  MINUTE_COLUMN_MODES,
  MONTH_COLUMN_MODES,
  RANGE_TAB,
  SECOND_COLUMN_MODES,
  YEAR_COLUMN_MODES,
} from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<DatetimePickerProps>(), defaultProps);

// 定义组件对外触发的事件
const emit = defineEmits<{
  /** 确认选择时触发，携带选中的值 */
  confirm: [value: DateValue];
  /** 关闭弹窗时触发 */
  close: [];
  /** 双向绑定更新事件 */
  'update:value': [value: DateValue];
}>();

const bemClass = computed(() => {
  return bem('datetime-picker', [props.mode], []);
});

// 计算弹窗标题：优先使用自定义标题，否则根据 mode 生成默认标题
const displayTitle = computed(() => {
  if (props.title && props.title.trim() !== '') {
    return props.title;
  } else if (props.mode === DATETIME_PICKER_MODE.DATE) {
    return '选择日期';
  } else if (props.mode === DATETIME_PICKER_MODE.MONTH) {
    return '选择月份';
  } else if (props.mode === DATETIME_PICKER_MODE.YEAR) {
    return '选择年份';
  }
  return '选择时间';
});

// 根据当前 mode 计算各列是否显示
const showYearColumn = computed(() => YEAR_COLUMN_MODES.includes(props.mode));
const showMonthColumn = computed(() => MONTH_COLUMN_MODES.includes(props.mode));
const showDayColumn = computed(() => DAY_COLUMN_MODES.includes(props.mode));
const showHourColumn = computed(() => HOUR_COLUMN_MODES.includes(props.mode));
const showMinuteColumn = computed(() => MINUTE_COLUMN_MODES.includes(props.mode));
const showSecondColumn = computed(() => SECOND_COLUMN_MODES.includes(props.mode));
// 是否为范围选择模式
const isRange = computed(() => props.range);
// 当前激活的范围选择 Tab（开始时间/结束时间）
const activeRangeTab = ref<RangeTab>(RANGE_TAB.START);

const formatTwoDigitLabel = (value: number) => `${value}`.padStart(2, '0');

// 格式化小时标签：特定模式下显示 "HH:00" 格式
const formatHourLabel = (hour: number) => {
  const twoDigitHour = formatTwoDigitLabel(hour);
  if (props.mode === DATETIME_PICKER_MODE.DATE_HOUR || props.mode === DATETIME_PICKER_MODE.HOUR) {
    return `${twoDigitHour}:00`;
  }
  return twoDigitHour;
};

/**
 * 生成闭区间数字序列，例如 [1, 3] => [1, 2, 3]。
 * 当 end < start 时，返回 [start]，避免出现空列导致 picker 无法定位。
 */
const createNumberRange = (start: number, end: number) => {
  if (end < start) {
    return [start];
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

// 统一处理 min/max 异常值：若传入非法时间，回退到默认前后 10 年。
const minDateValue = computed(() => {
  const date = new Date(props.minDate);
  if (Number.isNaN(date.getTime())) {
    return new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000);
  }
  return date;
});

// 计算最大日期：处理异常值，若传入非法时间，回退到默认前后 10 年
const maxDateValue = computed(() => {
  const date = new Date(props.maxDate);
  if (Number.isNaN(date.getTime())) {
    return new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);
  }
  return date;
});

// 计算全局下界日期（取 minDate 和 maxDate 中较小的那个）
const lowerBoundDate = computed(() => {
  return minDateValue.value.getTime() <= maxDateValue.value.getTime() ? minDateValue.value : maxDateValue.value;
});

// 计算全局上界日期（取 minDate 和 maxDate 中较大的那个）
const upperBoundDate = computed(() => {
  return minDateValue.value.getTime() <= maxDateValue.value.getTime() ? maxDateValue.value : minDateValue.value;
});

// 将日期夹紧到全局边界（minDate ~ maxDate）范围内
const clampDateToBounds = (date: Date) => {
  const time = date.getTime();
  if (time < lowerBoundDate.value.getTime()) {
    return new Date(lowerBoundDate.value);
  }
  if (time > upperBoundDate.value.getTime()) {
    return new Date(upperBoundDate.value);
  }
  return date;
};

// 将日期夹紧到指定区间内，主要用于范围选择下"当前 tab 可选区间"限制
const clampDate = (date: Date, lower: Date, upper: Date) => {
  const lowerTime = lower.getTime();
  const upperTime = upper.getTime();
  const time = date.getTime();
  if (time < lowerTime) {
    return new Date(lower);
  }
  if (time > upperTime) {
    return new Date(upper);
  }
  return date;
};

/**
 * 根据 mode 归一化时间精度，避免不可见列携带脏值：
 * - year 仅保留年
 * - month 保留到月
 * - date/date-hour/date-minute 等按模式保留对应粒度
 */
const normalizeDateByMode = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  if (props.mode === DATETIME_PICKER_MODE.YEAR) {
    return new Date(year, 0, 1, 0, 0, 0);
  }
  if (props.mode === DATETIME_PICKER_MODE.MONTH) {
    return new Date(year, month, 1, 0, 0, 0);
  }
  if (props.mode === DATETIME_PICKER_MODE.DATE) {
    return new Date(year, month, day, 0, 0, 0);
  }
  if (props.mode === DATETIME_PICKER_MODE.HOUR) {
    return new Date(year, month, day, hour, 0, 0);
  }
  if (props.mode === DATETIME_PICKER_MODE.MINUTE) {
    return new Date(year, month, day, hour, minute, 0);
  }
  if (props.mode === DATETIME_PICKER_MODE.DATE_HOUR) {
    return new Date(year, month, day, hour, 0, 0);
  }
  if (props.mode === DATETIME_PICKER_MODE.DATE_MINUTE) {
    return new Date(year, month, day, hour, minute, 0);
  }

  return new Date(year, month, day, hour, minute, second);
};

const isSameYMD = (a: Date, b: Date) => {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

// 判断两个日期是否是同年同月同日同时
const isSameYMDH = (a: Date, b: Date) => {
  return isSameYMD(a, b) && a.getHours() === b.getHours();
};

// 判断两个日期是否是同年同月同日同时同分
const isSameYMDHM = (a: Date, b: Date) => {
  return isSameYMDH(a, b) && a.getMinutes() === b.getMinutes();
};

// 获取安全的索引值，确保不越界
const getSafeIndex = (index: number, max: number) => {
  if (max < 0) {
    return 0;
  }
  if (index < 0) {
    return 0;
  }
  if (index > max) {
    return max;
  }
  return index;
};

// 获取安全的列值：如果目标值不在列中，则返回最接近的值
const getSafeColumnValue = (values: number[], target: number, fallback: number) => {
  if (values.length === 0) {
    return fallback;
  }
  const index = values.indexOf(target);
  if (index >= 0) {
    return values[index];
  }
  if (target < values[0]) {
    return values[0];
  }
  return values[values.length - 1];
};

// 获取指定年月的天数
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

/**
 * 将 DateValue 的单值形态解析为 Date：
 * - number：视为时间戳
 * - string：优先按数字时间戳解析，再按日期字符串解析
 * - 兜底：当前时间
 */
const parseSingleDateValue = (value: unknown) => {
  const parseTimestamp = (timestamp: number) => {
    if (!Number.isFinite(timestamp)) {
      return undefined;
    }
    // 兼容秒级时间戳（10位），统一转毫秒。
    const normalizedTimestamp = Math.abs(timestamp) < 1e11 ? timestamp * 1000 : timestamp;
    const date = new Date(normalizedTimestamp);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
    return undefined;
  };

  if (value instanceof Date) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (typeof value === 'number') {
    const date = parseTimestamp(value);
    if (date) {
      return date;
    }
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed !== '') {
      const asNumber = Number(trimmed);
      if (Number.isFinite(asNumber)) {
        const byStringNumber = parseTimestamp(asNumber);
        if (byStringNumber) {
          return byStringNumber;
        }
      }

      // 兼容 "YYYY-MM-DD HH:mm:ss" / "YYYY/MM/DD HH:mm:ss" 这类平台差异较大的格式。
      const normalized = trimmed.replace('T', ' ');
      const parts = normalized.match(
        /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2})(?::(\d{1,2})(?::(\d{1,2}))?)?)?$/
      );
      if (parts) {
        const year = Number(parts[1]);
        const month = Number(parts[2]) - 1;
        const day = Number(parts[3]);
        const hour = Number(parts[4] ?? 0);
        const minute = Number(parts[5] ?? 0);
        const second = Number(parts[6] ?? 0);
        const byParts = new Date(year, month, day, hour, minute, second);
        if (!Number.isNaN(byParts.getTime())) {
          return byParts;
        }
      }

      const byString = new Date(trimmed);
      if (!Number.isNaN(byString.getTime())) {
        return byString;
      }
    }
  }

  return new Date();
};

/**
 * 将 value 统一规范为 [startDate, endDate] 结构：
 * - 单值 -> [value, value]
 * - 数组 -> 缺少 end 时补成 start
 */
const normalizeRangeValue = (value: DatetimePickerProps['value']) => {
  if (Array.isArray(value)) {
    const start = parseSingleDateValue(value[0]);
    const end = value[1] === undefined ? start : parseSingleDateValue(value[1]);
    return [start, end] as const;
  }
  const date = parseSingleDateValue(value as string | number | undefined);
  return [date, date] as const;
};

// 单值模式选中的日期
const singleSelectedDate = ref(clampDateToBounds(normalizeDateByMode(normalizeRangeValue(props.value)[0])));
// 范围模式开始日期
const rangeStartDate = ref(singleSelectedDate.value);
// 范围模式结束日期
const rangeEndDate = ref(singleSelectedDate.value);

/**
 * 当前正在编辑的列（开始/结束）对应的动态下界：
 * - 编辑结束时间：下界不能小于开始时间
 * - 其他场景：使用全局下界
 */
const pickerLowerBound = computed(() => {
  if (!isRange.value) {
    return lowerBoundDate.value;
  }
  if (activeRangeTab.value === RANGE_TAB.END) {
    return rangeStartDate.value.getTime() > lowerBoundDate.value.getTime()
      ? rangeStartDate.value
      : lowerBoundDate.value;
  }
  return lowerBoundDate.value;
});

/**
 * 当前正在编辑的列（开始/结束）对应的动态上界：
 * - 编辑开始时间：上界不能大于结束时间
 * - 其他场景：使用全局上界
 */
const pickerUpperBound = computed(() => {
  if (!isRange.value) {
    return upperBoundDate.value;
  }
  if (activeRangeTab.value === RANGE_TAB.START) {
    return rangeEndDate.value.getTime() < upperBoundDate.value.getTime() ? rangeEndDate.value : upperBoundDate.value;
  }
  return upperBoundDate.value;
});

/**
 * 当前 picker 实际编辑的日期：
 * - 单值模式：singleSelectedDate
 * - 范围模式：active tab 对应 start/end
 *
 * 注意：滚动过程中仅更新内部状态（编辑态），不会触发 update:value；
 * 只有点击“确定”才会向外提交最终值。
 */
const editingDate = computed<Date>({
  get: () => {
    if (!isRange.value) {
      return singleSelectedDate.value;
    }
    return activeRangeTab.value === RANGE_TAB.START ? rangeStartDate.value : rangeEndDate.value;
  },
  set: date => {
    const next = clampDate(normalizeDateByMode(date), pickerLowerBound.value, pickerUpperBound.value);
    if (!isRange.value) {
      singleSelectedDate.value = next;
      return;
    }
    if (activeRangeTab.value === RANGE_TAB.START) {
      rangeStartDate.value = next;
      if (rangeStartDate.value.getTime() > rangeEndDate.value.getTime()) {
        rangeEndDate.value = new Date(rangeStartDate.value);
      }
      return;
    }
    rangeEndDate.value = next;
    if (rangeEndDate.value.getTime() < rangeStartDate.value.getTime()) {
      rangeStartDate.value = new Date(rangeEndDate.value);
    }
  },
});

/**
 * 每次打开弹窗（或关键入参变更）时，同步内部状态。
 * 这里统一通过 normalizeRangeValue 取值，避免 value 误传数组时单值模式解析异常。
 */
const syncPickerValueFromProps = () => {
  const [rawStart, rawEnd] = normalizeRangeValue(props.value);

  if (!isRange.value) {
    singleSelectedDate.value = clampDateToBounds(normalizeDateByMode(rawStart));
    return;
  }

  const nextStart = clampDateToBounds(normalizeDateByMode(rawStart));
  const nextEnd = clampDateToBounds(normalizeDateByMode(rawEnd));
  if (nextStart.getTime() <= nextEnd.getTime()) {
    rangeStartDate.value = nextStart;
    rangeEndDate.value = nextEnd;
  } else {
    rangeStartDate.value = nextEnd;
    rangeEndDate.value = nextStart;
  }
  activeRangeTab.value = RANGE_TAB.START;
};

// 范围 Tab 切换事件处理
const onRangeTabChange = (tab: RangeTab) => {
  activeRangeTab.value = tab;
};

// picker 滚动变化事件处理：将索引值还原为日期并更新编辑态
const onChange = (e: PickerChangeEvent) => {
  const indexes = (e?.detail?.value ?? []) as number[];
  const nextDate = buildDateFromIndexes(indexes);
  editingDate.value = nextDate;
};

/**
 * 按“当前编辑日期 + 当前可选上下界”动态构建各列候选项，
 * 让 min/max 和范围模式约束在滚动过程中实时生效。
 */
const pickerColumns = computed<PickerColumns>(() => {
  // 获取当前 picker 的动态上下界（范围模式下会随 tab 切换变化）
  const min = pickerLowerBound.value;
  const max = pickerUpperBound.value;
  // 将编辑日期夹紧到合法范围内作为基准日期
  const baseDate = clampDate(normalizeDateByMode(editingDate.value), min, max);

  // ========== 年列计算 ==========
  // 生成从 min 年份到 max 年份的序列
  const years = showYearColumn.value ? createNumberRange(min.getFullYear(), max.getFullYear()) : [];
  // 获取安全的已选年份（若基准年份不在范围内则取最接近值）
  const selectedYear = showYearColumn.value
    ? getSafeColumnValue(years, baseDate.getFullYear(), baseDate.getFullYear())
    : baseDate.getFullYear();

  // ========== 月列计算 ==========
  let monthStart = 1;
  let monthEnd = 12;
  // 月份范围受已选年份影响：若选中的是边界年份，则月份范围需要裁剪
  if (showMonthColumn.value && showYearColumn.value) {
    if (selectedYear === min.getFullYear()) {
      monthStart = min.getMonth() + 1; // 最小年份时，月份从 min 的月份开始
    }
    if (selectedYear === max.getFullYear()) {
      monthEnd = max.getMonth() + 1; // 最大年份时，月份到 max 的月份截止
    }
  }
  const months = showMonthColumn.value ? createNumberRange(monthStart, monthEnd) : [];
  const selectedMonth = showMonthColumn.value
    ? getSafeColumnValue(months, baseDate.getMonth() + 1, baseDate.getMonth() + 1)
    : baseDate.getMonth() + 1;

  // ========== 日列计算 ==========
  // 先获取当前年月的最大天数（如 2 月可能是 28 或 29 天）
  const dayMax = getDaysInMonth(selectedYear, selectedMonth);
  let dayStart = 1;
  let dayEnd = dayMax;
  // 日期范围受已选年月影响：若选中的是边界年月，则日期范围需要裁剪
  if (showDayColumn.value) {
    if (selectedYear === min.getFullYear() && selectedMonth === min.getMonth() + 1) {
      dayStart = min.getDate(); // 最小年月时，日期从 min 的日期开始
    }
    if (selectedYear === max.getFullYear() && selectedMonth === max.getMonth() + 1) {
      dayEnd = max.getDate(); // 最大年月时，日期到 max 的日期截止
    }
  }
  const days = showDayColumn.value ? createNumberRange(dayStart, Math.min(dayEnd, dayMax)) : [];
  const selectedDay = showDayColumn.value
    ? getSafeColumnValue(days, baseDate.getDate(), baseDate.getDate())
    : baseDate.getDate();

  // ========== 时列计算 ==========
  // 构建上下文日期（用于判断是否与 min/max 是同一天）
  const contextDate = new Date(selectedYear, selectedMonth - 1, selectedDay, 0, 0, 0);

  let hourStart = 0;
  let hourEnd = 23;
  // 小时范围受已选日期影响：若选中的是边界日期，则小时范围需要裁剪
  if (showHourColumn.value) {
    if (isSameYMD(contextDate, min)) {
      hourStart = min.getHours(); // 与 min 同一天时，小时从 min 的小时开始
    }
    if (isSameYMD(contextDate, max)) {
      hourEnd = max.getHours(); // 与 max 同一天时，小时到 max 的小时截止
    }
  }
  const hours = showHourColumn.value ? createNumberRange(hourStart, hourEnd) : [];
  const selectedHour = showHourColumn.value
    ? getSafeColumnValue(hours, baseDate.getHours(), baseDate.getHours())
    : baseDate.getHours();

  // ========== 分列计算 ==========
  // 构建上下文日期（用于判断是否与 min/max 是同一小时）
  const hourContextDate = new Date(selectedYear, selectedMonth - 1, selectedDay, selectedHour, 0, 0);

  let minuteStart = 0;
  let minuteEnd = 59;
  // 分钟范围受已选日期小时影响：若选中的是边界小时，则分钟范围需要裁剪
  if (showMinuteColumn.value) {
    if (isSameYMDH(hourContextDate, min)) {
      minuteStart = min.getMinutes(); // 与 min 同一小时时，分钟从 min 的分钟开始
    }
    if (isSameYMDH(hourContextDate, max)) {
      minuteEnd = max.getMinutes(); // 与 max 同一小时时，分钟到 max 的分钟截止
    }
  }
  const minutes = showMinuteColumn.value ? createNumberRange(minuteStart, minuteEnd) : [];
  const selectedMinute = showMinuteColumn.value
    ? getSafeColumnValue(minutes, baseDate.getMinutes(), baseDate.getMinutes())
    : baseDate.getMinutes();

  // ========== 秒列计算 ==========
  // 构建上下文日期（用于判断是否与 min/max 是同一分钟）
  const minuteContextDate = new Date(selectedYear, selectedMonth - 1, selectedDay, selectedHour, selectedMinute, 0);

  let secondStart = 0;
  let secondEnd = 59;
  // 秒范围受已选日期小时分钟影响：若选中的是边界分钟，则秒范围需要裁剪
  if (showSecondColumn.value) {
    if (isSameYMDHM(minuteContextDate, min)) {
      secondStart = min.getSeconds(); // 与 min 同一分钟时，秒从 min 的秒开始
    }
    if (isSameYMDHM(minuteContextDate, max)) {
      secondEnd = max.getSeconds(); // 与 max 同一分钟时，秒到 max 的秒截止
    }
  }
  const seconds = showSecondColumn.value ? createNumberRange(secondStart, secondEnd) : [];

  // 返回各列的候选值数组
  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
  };
});

const pickerValue = computed(() => {
  const columns = pickerColumns.value;
  const date = clampDate(normalizeDateByMode(editingDate.value), pickerLowerBound.value, pickerUpperBound.value);
  const indexes: number[] = [];

  if (showYearColumn.value) {
    const yearIndex = columns.years.findIndex(year => year === date.getFullYear());
    indexes.push(getSafeIndex(yearIndex, columns.years.length - 1));
  }

  if (showMonthColumn.value) {
    const monthIndex = columns.months.findIndex(month => month === date.getMonth() + 1);
    indexes.push(getSafeIndex(monthIndex, columns.months.length - 1));
  }

  if (showDayColumn.value) {
    const dayIndex = columns.days.findIndex(day => day === date.getDate());
    indexes.push(getSafeIndex(dayIndex, columns.days.length - 1));
  }

  if (showHourColumn.value) {
    const hourIndex = columns.hours.findIndex(hour => hour === date.getHours());
    indexes.push(getSafeIndex(hourIndex, columns.hours.length - 1));
  }

  if (showMinuteColumn.value) {
    const minuteIndex = columns.minutes.findIndex(minute => minute === date.getMinutes());
    indexes.push(getSafeIndex(minuteIndex, columns.minutes.length - 1));
  }

  if (showSecondColumn.value) {
    const secondIndex = columns.seconds.findIndex(second => second === date.getSeconds());
    indexes.push(getSafeIndex(secondIndex, columns.seconds.length - 1));
  }

  return indexes;
});

const activeParts = computed(() => {
  const date = clampDate(normalizeDateByMode(editingDate.value), pickerLowerBound.value, pickerUpperBound.value);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  };
});

const years = computed(() => pickerColumns.value.years);
const months = computed(() => pickerColumns.value.months);
const days = computed(() => pickerColumns.value.days);
const hours = computed(() => pickerColumns.value.hours);
const minutes = computed(() => pickerColumns.value.minutes);
const seconds = computed(() => pickerColumns.value.seconds);

/**
 * 将 picker 索引值还原为 Date。
 * 还原时以当前有效列数据为准，避免因为列变化导致越界。
 */
const buildDateFromIndexes = (indexes: number[]) => {
  const now = clampDate(normalizeDateByMode(editingDate.value), pickerLowerBound.value, pickerUpperBound.value);
  const columns = pickerColumns.value;
  let cursor = 0;
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();

  if (showYearColumn.value) {
    const yearIndex = getSafeIndex(indexes[cursor] ?? 0, columns.years.length - 1);
    year = columns.years[yearIndex] ?? year;
    cursor += 1;
  }

  if (showMonthColumn.value) {
    const monthIndex = getSafeIndex(indexes[cursor] ?? 0, columns.months.length - 1);
    month = columns.months[monthIndex] ?? month;
    cursor += 1;
  }

  if (showDayColumn.value) {
    const dayIndex = getSafeIndex(indexes[cursor] ?? 0, columns.days.length - 1);
    day = columns.days[dayIndex] ?? day;
    cursor += 1;
  }

  if (showHourColumn.value) {
    const hourIndex = getSafeIndex(indexes[cursor] ?? 0, columns.hours.length - 1);
    hour = columns.hours[hourIndex] ?? hour;
    cursor += 1;
  }

  if (showMinuteColumn.value) {
    const minuteIndex = getSafeIndex(indexes[cursor] ?? 0, columns.minutes.length - 1);
    minute = columns.minutes[minuteIndex] ?? minute;
    cursor += 1;
  }

  if (showSecondColumn.value) {
    const secondIndex = getSafeIndex(indexes[cursor] ?? 0, columns.seconds.length - 1);
    second = columns.seconds[secondIndex] ?? second;
  }

  return new Date(year, month - 1, day, hour, minute, second);
};

// 确认按钮点击事件：单值模式提交单个时间戳，范围模式提交时间戳数组
const onConfirm = () => {
  if (!isRange.value) {
    const date = clampDateToBounds(normalizeDateByMode(editingDate.value));
    singleSelectedDate.value = date;
    const value = date.getTime();
    emit('confirm', value);
    emit('update:value', value);
    emit('close');
    return;
  }

  const start = clampDateToBounds(normalizeDateByMode(rangeStartDate.value));
  const end = clampDateToBounds(normalizeDateByMode(rangeEndDate.value));
  const value = start.getTime() <= end.getTime() ? [start, end] : [end, start];
  rangeStartDate.value = value[0];
  rangeEndDate.value = value[1];
  const rangeValue: DateValue = [value[0].getTime(), value[1].getTime()];
  emit('confirm', rangeValue);
  emit('update:value', rangeValue);
  emit('close');
};

// 弹窗关闭事件：未点击"确定"时不向外提交值，依赖下次打开时从 props.value 重新同步
const onClose = () => {
  emit('close');
};

// 监听关键 props 变化，每次打开弹窗时同步内部状态，确保"未确认不生效"
watch(
  [() => props.show, () => props.value, () => props.mode, () => props.range, () => props.minDate, () => props.maxDate],
  () => {
    if (props.show) {
      syncPickerValueFromProps();
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.tsm-datetime-picker-popup :deep(.tsm-popup-content-body) {
  padding-bottom: 0 !important;
  padding-top: 0 !important;
}

.tsm-datetime-picker-range-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 0.5px solid var(--tsm-color-border-secondary);
  background-color: var(--tsm-color-bg-white);
}

.tsm-datetime-picker-range-tab {
  position: relative;
  flex: 1;
  height: 48px;
  line-height: 48px;
  color: var(--tsm-color-text-primary);
  text-align: center;
  font-size: var(--tsm-font-size-text-l);
  font-weight: var(--tsm-font-weight-regular);
}

.tsm-datetime-picker-range-tab-active {
  font-weight: var(--tsm-font-weight-bold);
}

.tsm-datetime-picker-range-tab-active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 16px;
  height: 3px;
  transform: translateX(-50%);
  border-radius: var(--tsm-radius-full);
  background: var(--tsm-color-primary);
}

/*
  picker-view 可视区域高度：
  - 与每行高度无强制绑定，可按设计稿调整；
  - 行高由 picker-view 的选中框高度决定（见 template 的 indicator-style）。
 */
.tsm-datetime-picker-view {
  height: 220px;
}

/* 上下两端白色渐变遮罩，实现选中区域边缘淡出效果 */
.tsm-datetime-picker-view :deep(.uni-picker-view-mask) {
  background-image:
    linear-gradient(180deg, hsla(0, 0%, 100%, 0.95), hsla(0, 0%, 100%, 0.1)),
    linear-gradient(0deg, hsla(0, 0%, 100%, 0.95), hsla(0, 0%, 100%, 0.1));
}

.tsm-datetime-picker-view .uni-picker-view-column:first-child .uni-picker-view-indicator {
  border-radius: var(--tsm-radius-m) 0 0 var(--tsm-radius-m);
}

.tsm-datetime-picker-view .uni-picker-view-column:last-child .uni-picker-view-indicator {
  border-radius: 0 var(--tsm-radius-m) var(--tsm-radius-m) 0;
}

.uni-picker-view-indicator {
  z-index: 0;
  background: var(--tsm-color-bg-tertiary);
}

.uni-picker-view-indicator::before,
.uni-picker-view-indicator::after {
  display: none;
}

/*
  每个选项的高度需要与 picker-view 选中框高度保持一致（当前为 40px），
  避免出现“看起来变高了，但吸附中心仍按旧高度计算”的错位问题。
 */
.tsm-datetime-picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  line-height: 40px;
  color: var(--tsm-color-text-primary);
  font-size: var(--tsm-font-size-text-l);
  font-style: normal;
  font-weight: var(--tsm-font-weight-regular);
}

.tsm-datetime-picker-item-active {
  color: var(--tsm-color-text-primary);
  font-size: var(--tsm-font-size-text-2xl);
  font-weight: var(--tsm-font-weight-bold);
}

.tsm-datetime-picker-footer {
  width: 100%;
  display: flex;
  justify-content: center;
}

.tsm-datetime-picker-footer .tsm-button {
  width: 100%;
}
</style>
