<template>
  <!-- 条件组 -->
  <div class="pfv-condition-group" v-for="item in props.groupList">
    <!-- 顶部操作栏 -->
    <section class="pcg-period">
      <!-- 托管期 -->
      <label>适用于</label>
      <span>{{ mapPeriodLabel(item.startPeriod) }}</span>
      <em>~</em>
      <span>{{ mapPeriodLabel(item.endPeriod) }}</span>
    </section>
    <!-- 条件组 -->
    <te-scrollbar>
      <section class="pcg-group">
        <!-- 判断条件 -->
        <div class="pcg-group-item">
          <div class="pcg-group-item-header">
            <span>判断条件</span>
          </div>
          <div class="pcg-group-item-body">
            <div class="pcg-group-item-body-formula" v-for="fItem in item.formulaList">
              <!-- 公式 -->
              <pfv-formula-render
                v-for="formulaComponent in fItem.conditionList"
                :formulaList="formulaComponent.conditionFormulaComponentList"
              ></pfv-formula-render>
            </div>
          </div>
        </div>
        <!-- 计算公式 -->
        <div class="pcg-group-item">
          <div class="pcg-group-item-header">
            <span>计算公式</span>
          </div>
          <div class="pcg-group-item-body">
            <div class="pcg-group-item-body-formula" v-for="fItem in item.formulaList">
              <span>{{ mapFormulaTitle() }}</span>
              <em>=</em>
              <!-- 公式 -->
              <pfv-formula-render :formulaList="fItem.formulaComponentList"></pfv-formula-render>
            </div>
          </div>
        </div>
      </section>
    </te-scrollbar>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { PropType, onMounted } from 'vue';
import { useStore } from 'vuex';
// api
import { PFE_IGroupInfoList } from '@/pages/project-manage/pm-formula-editor/pm-formula-editor.api';
import { CommonICodeName, Common_IValueLabel } from '@/service/api';
// 服务
import commonService from '@/service/pkg';
// 组件
import PfvFormulaRender from '../pfv-formula-render/pfv-formula-render.vue';
// 枚举
import { PM_EGrainSharingObject } from '@/pages/project-manage/constant/enum';
// store
const store = useStore();
// props
const props = defineProps({
  groupList: {
    type: Array as PropType<PFE_IGroupInfoList[]>,
    default: [],
  },
});

/**
 * 处理托管期展示
 * @param {number | null} period
 * @returns {string}
 */
const mapPeriodLabel = (period: number | null): string => {
  let str = '';
  const list: Common_IValueLabel<number>[] = store.getters.hostingPeriodList ?? [];
  list.forEach((item) => {
    if (period !== null && item.value === period) {
      str = item.label;
    }
  });
  return str;
};
/**
 * 表头名称
 * @returns {string}
 */
const mapFormulaTitle = (): string => {
  const map = new Map([
    [PM_EGrainSharingObject['国网/资方'], '国网/资方分享'],
    [PM_EGrainSharingObject.院方, '院方分享'],
    [PM_EGrainSharingObject.天溯, '天溯分享'],
  ]);
  return map.get(store.getters.grainSharingMode) ?? '天溯分享';
};
</script>
<style lang="less" scoped>
.pfv-condition-group {
  width: 100%;
  margin-top: var(--te-space-16);
  background-color: var(--te-fill-color-blank);
  border-radius: var(--te-space-4);
  border: 1px solid var(--te-border-color-lighter);

  .pcg-period {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;

    padding: var(--te-space-8) var(--te-space-16);
    border-bottom: 1px solid var(--te-border-color-lighter);
    background: var(--te-fill-color-light);
    gap: var(--te-space-8);

    * {
      color: var(--te-text-color-regular);
    }
  }

  .pcg-group {
    padding: 9px var(--te-space-16);
    background-color: var(--te-fill-color-blank);

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: var(--te-space-24);

    .pcg-group-item {
      display: flex;
      flex-direction: column;
      gap: var(--te-space-12);

      .pcg-group-item-header {
        color: var(--te-text-color-secondary);
        font-size: var(--te-font-size-b14);
      }

      .pcg-group-item-body {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--te-space-12);

        .pcg-group-item-body-formula {
          gap: var(--te-space-12);
          display: flex;
          align-items: center;
        }
      }
    }
  }
}
</style>
