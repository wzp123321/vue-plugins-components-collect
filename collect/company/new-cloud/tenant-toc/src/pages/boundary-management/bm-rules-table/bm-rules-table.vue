<template>
  <div class="bm-rules-table" id="bm-rules-table">
    <!-- tab切换 -->
    <ul v-if="ruleTable.filterTypeList?.length !== 0">
      <li
        v-for="(item, index) in ruleTable.filterTypeList"
        :key="'rule_' + index"
        :class="[
          'bm-rt-tabitem',
          ruleTable.mapFilterTypeActive(item.measureType, item.verificationType) ? 'selected' : '',
        ]"
        @click="ruleTable.selectFilterType(item.measureType, item.verificationType)"
      >
        {{ item.name }}
      </li>
      <div
        class="bm-rt-selected"
        v-show="ruleTable.mapSelectVisible()"
        :style="{ left: ruleTable.mapFilterTabLeft(), width: ruleTable.mapFilterTabWidth() }"
      ></div>
    </ul>
    <!-- 规则数据 -->
    <div class="bm-rt-wrapper" v-loading="ruleTable.loading">
      <table v-if="!ruleTable.isEmpty && !ruleTable.loading">
        <thead>
          <tr>
            <th></th>
            <th v-for="(item, index) in headerList" :key="'th_' + index">
              {{ item }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>合计（元）</td>
            <td
              v-for="(item, index) in headerList"
              :key="'td_' + index"
              :title="
                ruleTable.ruleDataList?.[`${item}`] !== null
                  ? thousandSeparation(ruleTable.ruleDataList?.[`${item}`]) + ''
                  : '-'
              "
            >
              {{
                ruleTable.ruleDataList?.[`${item}`] !== null
                  ? thousandSeparation(ruleTable.ruleDataList?.[`${item}`])
                  : '-'
              }}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="bm-rt-empty" v-if="!ruleTable.loading && ruleTable.isEmpty">
        <img src="../../../assets/images/common/common-data-none.svg" alt="empty" />
        <p>暂无数据</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, computed, onUnmounted } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import BmRuleTableService from './bm-rules-table.service';
import bmDataService from '../boundary-management.service';

import { thousandSeparation } from '../../../utils/index';

const ruleTable = new BmRuleTableService();
const destroy$ = new Subject<void>();

// 表头
const headerList = computed(() => {
  return Object.keys(ruleTable.ruleDataList);
});
/**
 * 初始化
 */
onMounted(() => {
  bmDataService.bmQueryParams.pipe(takeUntil(destroy$)).subscribe((v) => {
    ruleTable.mapFilterTypeList(v)
    ruleTable.queryRuleList(v);
  });
});
/**
 * 组件销毁
 */
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});
</script>
<style lang="less" scoped>
#bm-rules-table {
  min-height: 112px;
  width: 100%;
  --bm-rule-bg-color: rgba(237, 245, 252, 1);

  > ul {
    position: relative;
    display: flex;
    align-items: center;
    gap: 40px;
    margin-bottom: 0;

    > li {
      cursor: pointer;
      padding: 9px 0;
      color: var(--color-text-title);
    }

    > li.selected {
      color: var(--color-primary);
    }

    > .bm-rt-selected {
      position: absolute;
      bottom: 0;
      left: 0;

      height: 2px;
      background-color: var(--color-primary);

      transition: left 233ms;
    }
  }

  > .bm-rt-wrapper > table {
    width: 100%;

    th,
    td {
      background-color: var(--bm-rule-bg-color);
      border-bottom: 1px solid var(--color-text-divider);
    }

    th {
      border-top: 1px solid var(--color-text-divider);
      border-right: 1px solid var(--color-text-divider);
    }

    td {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    td:first-child {
      border-right: 1px solid var(--color-text-divider);
    }
  }

  > .bm-rt-wrapper > .bm-rt-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    img {
      width: 60px;
      height: 60px;
    }

    p {
      color: var(--color-text-disable);
    }
  }
}
</style>
