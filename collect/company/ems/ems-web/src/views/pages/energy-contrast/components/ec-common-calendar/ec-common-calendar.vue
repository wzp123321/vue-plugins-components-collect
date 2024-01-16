<template>
  <div class="ec-common-calendar">
    <el-popover
      placement="bottom"
      popper-class="common-calendar-popper"
      :show-arrow="false"
      v-model:visible="isShowPopper"
      :width="324"
      trigger="click"
      @show="showPopover"
    >
      <template #reference>
        <div class="calendar-input" :class="{ 'input-has-data': selectedMap.size !== 0 }">
          <ul v-if="selectedMap.size !== 0">
            <li v-for="[key, item] in selectedMap">
              <span>{{ formatDate(item) }}</span>
              <i class="el-icon-close" @click.stop="deleteChoose(key)"></i>
            </li>
          </ul>
          <div class="placeholder" v-else>{{ props.placeholder }}</div>
          <i class="iconfont icon-Calendar"></i>
          <i class="iconfont icon-Close-Circle-Fill" @click.stop="clearList"></i>
        </div>
      </template>
      <!-- 选择日期面板 -->
      <div class="date-select-container" v-show="isShowDate">
        <div class="calendar-header">
          <div class="header-left-arrow">
            <i @click="lastYear" class="iconfont icon-doubleleft"></i>
            <i class="arrow-left iconfont icon-left" @click.prevent="lastMonth"></i>
          </div>
          <div class="header-date">
            <span class="header-year" @click="toSelectYear">{{ year }}&nbsp;年</span>
            <span class="header-month" @click="toSelectMonth">{{ month }}&nbsp;月</span>
          </div>
          <div class="header-right-arrow">
            <i class="arrow-right iconfont icon-Right" @click="nextMonth"></i>
            <i @click="nextYear" class="iconfont icon-a-doubleright"></i>
          </div>
        </div>
        <div class="calendar-content">
          <ul class="week-list">
            <li>一</li>
            <li>二</li>
            <li>三</li>
            <li>四</li>
            <li>五</li>
            <li>六</li>
            <li>日</li>
          </ul>
          <ul
            class="date-list"
            :class="{ 'is-week-selected': isSelectedDate(item?.[0], 'week') }"
            v-for="item in dateList"
            @click.stop="onClickWeek(item)"
          >
            <li :class="{ 'is-disabled': ele.isDisabled }" v-for="ele in item">
              <div
                :class="{
                  'is-current': ele.isCurrent && ele.month === month,
                  'isnot-current-month': !ele.isCurrentMonth,
                  'is-selected': isSelectedDate(ele, 'date'),
                }"
                @click="onClickDate($event, ele)"
              >
                {{ ele.date }}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- 选择年份面板 -->
      <div class="year-select-container" v-show="isShowYear">
        <div class="calendar-header">
          <div class="header-left-arrow">
            <i @click="lastTenYear" class="iconfont icon-doubleleft"></i>
          </div>
          <div class="header-date">
            <span class="header-year">{{ startYear }}&nbsp;年&nbsp;-&nbsp;{{ startYear + 9 }}&nbsp;年</span>
          </div>
          <div class="header-right-arrow">
            <i @click="nextTenYear" class="iconfont icon-a-doubleright"></i>
          </div>
        </div>
        <div class="calendar-content">
          <ul class="month-list">
            <li v-for="ele in yearList">
              <div :class="{ 'is-current': ele.isCurrent, 'is-disabled': ele.isDisabled }" @click="onClickYear(ele)">
                {{ ele.year }}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- 选择月份面板 -->
      <div class="month-select-container" v-show="isShowMonth">
        <div class="calendar-header">
          <div class="header-left-arrow">
            <i @click="lastYearMonth" class="iconfont icon-doubleleft"></i>
          </div>
          <div class="header-date">
            <span class="header-year">{{ year }}&nbsp;年</span>
          </div>
          <div class="header-right-arrow">
            <i @click="nextYearMonth" class="iconfont icon-a-doubleright"></i>
          </div>
        </div>
        <div class="calendar-content">
          <ul class="month-list">
            <li v-for="ele in monthList">
              <div :class="{ 'is-current': ele.isCurrent, 'is-disabled': ele.isDisabled }" @click="onClickMonth(ele)">
                {{ cNum(ele.month) }}月
              </div>
            </li>
          </ul>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import dayjs from 'dayjs';
import message from '@/utils/message';

interface DateItem {
  date: number;
  month: number;
  year: number;
  week: number;
  isCurrent: boolean;
  isCurrentMonth: boolean;
  isDisabled: boolean;
}
interface YearItem {
  year: number;
  isCurrent: boolean;
  isDisabled: boolean;
}
interface MonthItem {
  month: number;
  isCurrent: boolean;
  isDisabled: boolean;
}
interface Props {
  disabledDate: (date: Date) => boolean;
  chooseTimeList: string[];
  type: 'date' | 'week';
  placeholder: string;
}
const props = withDefaults(defineProps<Props>(), {
  disabledDate: (date: Date) => {
    return false;
  },
  chooseTimeList: () => [],
  type: 'date',
  placeholder: '',
});
const emit = defineEmits(['getChooseDateValue']);

const isShowPopper = ref(false);

const dateList = ref<DateItem[][]>([]);
const yearList = ref<YearItem[]>();
const monthList = ref<MonthItem[]>();

const isShowDate = ref(true);
const isShowMonth = ref(false);
const isShowYear = ref(false);

const year = ref(0);
const month = ref(0);
const startYear = ref(0);

const selectedMap = ref<Map<string, DateItem>>(new Map());

watch(
  () => props.chooseTimeList,
  (newV) => {
    selectedMap.value.clear();
    newV?.forEach((item) => {
      const dateTemp = new Date(item);
      const dateItem = {
        date: dateTemp.getDate(),
        month: dateTemp.getMonth() + 1,
        year: dateTemp.getFullYear(),
        week: dateTemp.getDay(),
        isCurrent: isCurrentDate(dateTemp),
        isCurrentMonth: isInCurrentMonth(dateTemp),
        isDisabled: props.disabledDate(dateTemp),
      };
      selectedMap.value.set(mapKey(dateItem), dateItem);
    });
  },
  {
    immediate: true,
  },
);

function showPopover() {
  isShowDate.value = true;
  isShowMonth.value = false;
  isShowYear.value = false;
  let nowDate = new Date();
  if (selectedMap.value.size) {
    nowDate = new Date(Array.from(selectedMap.value.keys()).pop() || '');
  }
  year.value = nowDate.getFullYear();
  month.value = nowDate.getMonth() + 1;
  dateList.value = getDateList(nowDate.getFullYear(), nowDate.getMonth() + 1);
  startYear.value = nowDate.getFullYear();
}

function clearList() {
  selectedMap.value.clear();
  emit('getChooseDateValue', Array.from(selectedMap.value.keys()), 'date');
}

function deleteChoose(key: string) {
  selectedMap.value.delete(key);
  emit('getChooseDateValue', Array.from(selectedMap.value.keys()), 'date');
}

//#region 获取年，月，日列表
function getDateList(year: number, month: number) {
  const cursorDay = new Date(year, month - 1, 1, 0, 0, 0, 0);
  cursorDay.setDate(cursorDay.getDate() - (cursorDay.getDay() === 0 ? 6 : cursorDay.getDay() - 1));
  const calendarList: DateItem[][] = [];
  for (let i = 0; i < 6; i++) {
    let arr = [];
    for (let j = 0; j < 7; j++) {
      const dataItem = {
        date: cursorDay.getDate(),
        month: cursorDay.getMonth() + 1,
        year: cursorDay.getFullYear(),
        week: cursorDay.getDay(),
        isCurrent: isCurrentDate(cursorDay),
        isCurrentMonth: isInCurrentMonth(cursorDay),
        isDisabled: props.disabledDate(cursorDay),
      };
      arr.push(dataItem);
      cursorDay.setDate(cursorDay.getDate() + 1);
    }
    calendarList.push(arr);
  }
  return calendarList;
}
function getMonthList(year: number) {
  const cursorMonth = new Date(year, 0, 1, 0, 0, 0, 0);
  const calendarList: MonthItem[] = [];
  for (let i = 0; i < 12; i++) {
    const dataItem = {
      month: cursorMonth.getMonth() + 1,
      isCurrent: isCurrentMonth(cursorMonth),
      isDisabled: props.disabledDate(cursorMonth),
    };
    cursorMonth.setMonth(cursorMonth.getMonth() + 1);
    calendarList.push(dataItem);
  }
  return calendarList;
}

function getYearList(startYear: number) {
  const cursorYear = new Date(startYear, 0, 1, 0, 0, 0, 0);
  const calendarList: YearItem[] = [];
  for (let i = 0; i < 10; i++) {
    const dataItem = {
      year: cursorYear.getFullYear(),
      isCurrent: isCurrentYear(cursorYear),
      isDisabled: props.disabledDate(cursorYear),
    };
    calendarList.push(dataItem);
    cursorYear.setFullYear(cursorYear.getFullYear() + 1);
  }
  return calendarList;
}
//#endregion

//#region 判断当前时间
function isInCurrentMonth(date: Date) {
  return month.value === date.getMonth() + 1;
}
function isCurrentDate(date: Date) {
  const curDate = new Date();
  return (
    curDate.getFullYear() === date.getFullYear() &&
    curDate.getMonth() === date.getMonth() &&
    curDate.getDate() === date.getDate()
  );
}
function isCurrentMonth(date: Date) {
  const curDate = new Date();
  return curDate.getFullYear() === date.getFullYear() && curDate.getMonth() === date.getMonth();
}
function isCurrentYear(date: Date) {
  const curDate = new Date();
  return curDate.getFullYear() === date.getFullYear();
}
function isSelectedDate(date: DateItem, flag: string) {
  return selectedMap.value.has(mapKey(date)) && flag === props.type;
}
//#endregion

//#region 日期面板点击事件
function toSelectYear() {
  isShowDate.value = false;
  isShowYear.value = true;
  isShowMonth.value = false;
  startYear.value = Math.floor(year.value / 10) * 10;
  yearList.value = getYearList(startYear.value);
}
function toSelectMonth() {
  isShowDate.value = false;
  isShowYear.value = false;
  isShowMonth.value = true;
  monthList.value = getMonthList(year.value);
}
function onClickWeek(item: DateItem[]) {
  if (props.type !== 'week') {
    return;
  }
  if (item[0]?.isDisabled) {
    return;
  }
  if (selectedMap.value.get(mapKey(item[0]))) {
    selectedMap.value.delete(mapKey(item[0]));
    return;
  }
  if (Array.from(selectedMap.value.keys()).length === 10) {
    message.error('日期最多可选10个！');
    return;
  }
  selectedMap.value.set(mapKey(item[0]), { ...item[0] });
  emit('getChooseDateValue', Array.from(selectedMap.value.keys()), 'week');
}
function onClickDate(e: Event, item: DateItem) {
  if (props.type !== 'date') {
    return;
  } else {
    e.stopPropagation();
  }
  if (item.isDisabled) {
    return;
  }
  if (selectedMap.value.get(mapKey(item))) {
    selectedMap.value.delete(mapKey(item));
    return;
  }
  if (Array.from(selectedMap.value.keys()).length === 10) {
    message.error('日期最多可选10个！');
    return;
  }
  selectedMap.value.set(mapKey(item), { ...item });
  emit('getChooseDateValue', Array.from(selectedMap.value.keys()), 'date');
}
function mapKey(item: DateItem) {
  return `${item.year}-${item.month.toString().padStart(2, '0')}-${item.date.toString().padStart(2, '0')}`;
}
function onClickMonth(item: MonthItem) {
  if (item.isDisabled) {
    return;
  }
  isShowDate.value = true;
  isShowYear.value = false;
  isShowMonth.value = false;
  month.value = item.month;
  dateList.value = getDateList(year.value, item.month);
}
function onClickYear(item: YearItem) {
  if (item.isDisabled) {
    return;
  }
  isShowDate.value = false;
  isShowYear.value = false;
  isShowMonth.value = true;
  year.value = item.year;
  monthList.value = getMonthList(item.year);
}
//#endregion

//#region 日期选择面板，上一个，下一个
function lastMonth() {
  if (month.value === 1) {
    month.value = 12;
    year.value--;
  } else {
    month.value--;
  }
  dateList.value = getDateList(year.value, month.value);
}
function nextMonth() {
  if (month.value === 12) {
    month.value = 1;
    year.value++;
  } else {
    month.value++;
  }
  dateList.value = getDateList(year.value, month.value);
}
function lastYear() {
  year.value--;
  dateList.value = getDateList(year.value, month.value);
}
function nextYear() {
  year.value++;
  dateList.value = getDateList(year.value, month.value);
}
function lastYearMonth() {
  year.value--;
  monthList.value = getMonthList(year.value);
}
function nextYearMonth() {
  year.value++;
  monthList.value = getMonthList(year.value);
}
function lastTenYear() {
  startYear.value = startYear.value - 10;
  yearList.value = getYearList(startYear.value);
}
function nextTenYear() {
  startYear.value = startYear.value + 10;
  yearList.value = getYearList(startYear.value);
}
//#endregion

function cNum(num: number) {
  const arr = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  return arr[num];
}
function formatDate(item: DateItem) {
  if (props.type === 'date') {
    return `${item.year}-${item.month.toString().padStart(2, '0')}-${item.date.toString().padStart(2, '0')}`;
  } else if (props.type === 'week') {
    return dayjs(
      `${item.year}-${item.month.toString().padStart(2, '0')}-${item.date.toString().padStart(2, '0')}`,
    ).format('gggg-w周');
  }
}
</script>

<style lang="less">
.ec-common-calendar {
  .calendar-input {
    width: 297px;
    height: 36px;
    line-height: 22px;
    padding: 4px 0px 4px 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    position: relative;
    box-sizing: border-box;
    .iconfont {
      line-height: 16px;
      font-size: 16px;
      position: absolute;
      right: 8px;
      top: 10px;
      color: var(--color-text-disable);

      &.icon-Close-Circle-Fill {
        display: none;
        color: rgba(0, 0, 0, 0.25);

        &:hover {
          color: rgba(0, 0, 0, 0.45);
        }
      }
    }
    ul {
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      overflow: auto;
      padding-right: 30px;
      li {
        width: 110px;
        height: 24px;
        line-height: 24px;
        padding-left: 8px;
        display: flex;
        align-items: center;
        color: rgba(0, 0, 0, 0.65);
        background-color: #fafafa;
        border: 1px solid #e8e8e8;
        border-radius: 2px;
        cursor: default;
        box-sizing: border-box;
        position: relative;
        .el-icon-close {
          position: absolute;
          right: 8px;
        }
      }
    }
    .placeholder {
      display: inline-block;
      height: 100%;
      line-height: 26px;
      color: rgba(0, 0, 0, 0.25);
    }
  }
  .input-has-data {
    &:hover {
      border-color: #40a9ff;
      .iconfont.icon-Close-Circle-Fill {
        display: inline-block;
      }
      .iconfont.icon-Calendar {
        display: none;
      }
    }
  }
}
.common-calendar-popper {
  padding: 0px !important;
  user-select: none;
  .calendar-header {
    height: 40px;
    padding: 9px 16px 8px;
    color: rgba(0, 0, 0, 0.85);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: space-between;
    .header-left-arrow {
      display: flex;
      align-items: center;
    }
    .header-right-arrow {
      display: flex;
      align-items: center;
    }
    .header-date {
      line-height: 22px;
      span {
        display: inline-block;
        height: 22px;
      }
      .header-month {
        padding: 0 5px;
        cursor: pointer;
      }
      .header-year {
        cursor: pointer;
        padding: 0 5px;
      }
    }
    .arrow-left {
      margin-left: 28px;
    }
    .arrow-right {
      margin-right: 28px;
    }
    i {
      width: 14px;
      height: 14px;
      svg {
        width: 14px;
        height: 14px;
      }
    }
  }
  .calendar-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    .week-list {
      display: flex;
      justify-content: space-between;
      li {
        flex: 1;
        height: 30px;
        text-align: center;
        line-height: 30px;
        cursor: default;
      }
    }
    .date-list {
      display: flex;
      li {
        flex: 1;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        > div {
          width: 24px;
          height: 24px;
          text-align: center;
          line-height: 24px;
        }
      }
    }
    .date-list:not(.is-week-selected) {
      li {
        > div:not(.is-current, .is-selected) {
          &:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }
        }
      }
      li.is-disabled {
        div {
          &:hover {
            background-color: transparent;
          }
        }
      }
      .is-disabled {
        color: rgba(0, 0, 0, 0.25);
        background-color: rgba(0, 0, 0, 0.04);
        cursor: not-allowed;
      }
      .is-selected {
        color: white !important;
        background-color: rgba(24, 144, 255, 1);
        border-radius: 2px;
      }
      .isnot-current-month {
        color: rgba(0, 0, 0, 0.25);
      }
      .is-current {
        color: rgba(24, 144, 255, 1);
        border: 1px solid rgba(24, 144, 255, 1);
        border-radius: 2px;
        box-sizing: border-box;
      }
    }
    .is-week-selected {
      color: white;
      background-color: rgba(24, 144, 255, 1);
    }
    .month-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(3, 56px);
      place-items: stretch stretch;
      li {
        display: flex;
        justify-content: center;
        align-items: center;
        > div {
          width: 60px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          border-radius: 2px;
          cursor: pointer;
        }
        > div:not(.is-current) {
          &:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }
        }
        .is-current {
          color: white;
          background-color: rgba(24, 144, 255, 1);
        }
        .is-disabled {
          color: rgba(0, 0, 0, 0.25);
          background-color: rgba(0, 0, 0, 0.04);
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
