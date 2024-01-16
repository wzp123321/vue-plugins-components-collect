<template>
  <!-- 条件组 -->
  <div class="ph-condition-group">
    <!-- 顶部操作栏 -->
    <section class="pcg-tool">
      <!-- 托管期 -->
      <div class="pcg-tool-period">
        <label>适用于</label>
        <!-- 开始托管期   -->
        <te-select placeholder="开始托管期" v-model="props.groupInfo.startPeriod" @change="handlePeriodChange">
          <te-option
            v-for="item in props.hostingScopeList"
            :key="item.value"
            :value="item.value"
            :label="item.label"
            :disabled="mapStartPeriodDisabled(item.value, props.groupInfo.endPeriod)"
          ></te-option>
        </te-select>
        <em>-</em>
        <!-- 结束托管期 -->
        <te-select placeholder="结束托管期" v-model="props.groupInfo.endPeriod" @change="handlePeriodChange">
          <te-option
            v-for="item in props.hostingScopeList"
            :key="item.value"
            :value="item.value"
            :label="item.label"
            :disabled="mapEndPeriodDisabled(item.value, props.groupInfo.startPeriod)"
          ></te-option>
        </te-select>
      </div>
      <!-- 按钮 -->
      <div class="pcg-tool-btn">
        <icon-copy-document title="复制" @click="handleGroupCopy" />
        <icon-delete @click="handleGroupDelete" />
      </div>
    </section>

    <!-- 条件组 -->
    <te-scrollbar ref="scrollbarRef">
      <section class="pcg-group">
        <!-- 判断条件 -->
        <div class="pcg-group-condition">
          <div class="pcg-group-condition-header">
            <span>判断条件</span>
            <span class="pcg-group-condition-header-btn">
              <icon-plus @click="() => props.groupInfo.addCondition()" />
            </span>
          </div>
          <div
            class="pcg-group-condition-body"
            v-for="(item, index) in props.groupInfo.conditionList"
            :key="randomNumber16()"
          >
            <template v-for="childItem in item.judgementConditions" :key="randomNumber16()">
              <!-- 公式编辑 -->
              <pfe-expression-container
                v-model="childItem.conditionFormulaComponentList"
                :containerType="PFE_EContainerType.条件"
                @index-change="handleIndexChange"
                @index-delete="handleIndexChange"
              ></pfe-expression-container>
            </template>
            <!-- 跳转复制 -->
            <icon-copy-document @click="handleConditionCopy(item, index)" />
            <!-- 条件删除 -->
            <icon-delete @click="handleConditionDelete(item, index)" />
          </div>
        </div>
        <!-- 计算公式 -->
        <div class="pcg-group-formula">
          <div class="pcg-group-formula-header">
            <span>计算公式</span>
          </div>
          <div class="pcg-group-formula-item" v-for="item in props.groupInfo.conditionList" :key="randomNumber16()">
            <span>{{ mapFormulaTitle() }}</span>
            <em>=</em>
            <!-- 公式编辑 -->
            <pfe-expression-container
              v-model="item.computationalFormulas"
              :containerType="PFE_EContainerType.公式"
              @index-change="handleIndexChange"
              @index-delete="handleIndexChange"
            ></pfe-expression-container>
          </div>
        </div>
      </section>
    </te-scrollbar>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { nextTick, ref } from 'vue';
import { useStore } from 'vuex';
// 服务
import draggableFormulaService from '../../../pm-formula-editor.service';
// 组件
import pfeExpressionContainer from '../../pfe-drag-container/pfe-drag-container.vue';
import { IconDelete, IconCopyDocument, IconPlus } from '@arco-iconbox/vue-te';
// 枚举
import { PM_EGrainSharingObject } from '@/pages/project-manage/constant/enum';
import { PFE_EContainerType } from '../../../enums';
// api
import { ConditionClass } from '../../../pm-formula-editor.api';
// 工具方法
import { randomNumber16 } from '../../../../../../utils/index';
import { debounce } from 'lodash';
// store
const store = useStore();

// props
interface Props {
  groupInfo: any;
  hostingScopeList: any;
  groupIndex: number;
}
const props = withDefaults(defineProps<Props>(), {
  groupInfo: {
    id: null,
    startPeriod: null,
    endPeriod: null,
    conditionList: [],

    addCondition: () => {},
    copyCondition: () => {},
    deleteCondition: () => {},
    addConfiguredDataIndex: () => {},
    addConfiguredFormulaIndex: () => {},
  },
  hostingScopeList: [],
  groupIndex: 0,
});

/**
 * 开始托管期禁用
 * @param {number} value
 * @param {number} endPeriod
 * @returns {boolean}
 */
const mapStartPeriodDisabled = (value: number, endPeriod: number) => {
  return endPeriod !== null && value > endPeriod;
};
/**
 * 结束托管期禁用
 * @param {number} value
 * @param {number} startPeriod
 * @returns {boolean}
 */
const mapEndPeriodDisabled = (value: number, startPeriod: number) => {
  return startPeriod !== null && value < startPeriod;
};
/**
 * 修改托管期
 */
const handlePeriodChange = () => {
  // 修改保存状态
  store.dispatch('setUnSaveFlag', true);
};

/**
 * 复制
 */
const handleGroupCopy = debounce(
  () => {
    draggableFormulaService.copyGroup(props.groupInfo, props.groupIndex);
  },
  666,
  {
    leading: true,
  },
);
/**
 * 删除
 * @returns {void}
 */
const handleGroupDelete = (): void => {
  draggableFormulaService.deleteGroup(props.groupIndex);
};

// 滚动条组件
const scrollbarRef = ref();
/**
 * 公式change-回调
 * @returns {void}
 */
const handleIndexChange = (): void => {
  if (scrollbarRef.value) {
    nextTick(() => {
      scrollbarRef.value?.update();
    });
  }
};
/**
 * 复制条件,重新生成map
 * @param {ConditionClass} item
 * @param {number} index
 * @returns {void}
 */
const handleConditionCopy = debounce(
  (item: ConditionClass, index: number): void => {
    props.groupInfo.copyCondition(item, index);

    // 公式
    item?.computationalFormulas?.forEach((computational) => {
      draggableFormulaService.addIndexInFormula(computational.serialNumber, computational.indexType);
    });
    // 判断条件
    item?.judgementConditions?.forEach((judgement) => {
      judgement?.conditionFormulaComponentList?.forEach((conditionFormula) => {
        draggableFormulaService.addIndexInFormula(conditionFormula.serialNumber, conditionFormula.indexType);
      });
    });
  },
  666,
  {
    leading: true,
  },
);
/**
 * 删除条件
 * @param {ConditionClass} item
 * @param {number} index
 * @returns {void}
 */
const handleConditionDelete = (item: ConditionClass, index: number): void => {
  props.groupInfo.deleteCondition(index);

  // 公式
  item?.computationalFormulas?.forEach((computational) => {
    draggableFormulaService.removeIndexInFormula(computational.serialNumber, computational.indexType);
  });
  // 判断条件
  item?.judgementConditions?.forEach((judgement) => {
    judgement?.conditionFormulaComponentList?.forEach((conditionFormula) => {
      draggableFormulaService.removeIndexInFormula(conditionFormula.serialNumber, conditionFormula.indexType);
    });
  });
};
/**
 * 表头名称
 */
const mapFormulaTitle = () => {
  const map = new Map([
    [PM_EGrainSharingObject['国网/资方'], '国网/资方分享'],
    [PM_EGrainSharingObject.院方, '院方分享'],
    [PM_EGrainSharingObject.天溯, '天溯分享'],
  ]);
  return map.get(store.getters.grainSharingMode) ?? '天溯分享';
};
</script>
<style lang="less" scoped>
.ph-condition-group {
  width: 100%;
  margin-top: var(--te-space-16);
  background-color: var(--te-fill-color-blank);
  border-radius: var(--te-space-4);
  border: 1px solid var(--te-border-color-lighter);

  svg {
    cursor: pointer;
  }

  .pcg-tool {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    padding: var(--te-space-8) var(--te-space-16);
    border-bottom: 1px solid var(--te-border-color-lighter);
    background: var(--te-fill-color-light);

    .pcg-tool-period {
      display: flex;
      flex-direction: row;
      align-items: center;

      :deep(.te-select) {
        width: 136px;
        color: var(--te-text-color-regular);

        .te-input__wrapper,
        .te-input__wrapper.is-focus,
        input {
          background: var(--te-fill-color-light) !important;
          box-shadow: none !important;
        }

        input::placeholder {
          color: var(--te-text-color-placeholder);
        }
      }
    }

    .pcg-tool-btn {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 18px;
    }
  }

  .pcg-group {
    padding: 9px var(--te-space-16);
    background-color: var(--te-fill-color-blank);

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: var(--te-space-24);

    .pcg-group-condition,
    .pcg-group-formula {
      display: flex;
      flex-direction: column;
      gap: var(--te-space-12);
    }

    .pcg-group-condition-header,
    .pcg-group-formula-header {
      color: var(--te-text-color-secondary);
      font-size: var(--te-font-size-b14);
    }

    .pcg-group-condition {
      .pcg-group-condition-body {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--te-space-12);
      }

      .pcg-group-condition-header {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;

        .pcg-group-condition-header-btn {
          cursor: pointer;
          background-color: var(--te-fill-color-blank);
          border: 1px solid var(--te-border-color);
          border-radius: var(--te-space-4);

          width: var(--te-space-24);
          height: var(--te-space-24);
          line-height: var(--te-space-24);
          text-align: center;

          svg {
            width: var(--te-space-12);
            height: var(--te-space-12);
          }
        }
      }
    }

    .pcg-group-formula-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--te-space-12);
    }
  }
}
</style>
