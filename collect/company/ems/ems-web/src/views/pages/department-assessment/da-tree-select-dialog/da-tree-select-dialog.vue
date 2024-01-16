<template>
  <te-dialog
    modal-class="da-tree-select-dialog"
    v-model="treeSelectDialogService.visible"
    title="考核科室"
    :append-to-body="false"
    width="800"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="treeSelectDialogService.close()"
  >
    <div class="dtsd-transfer">
      <div class="dtsd-transfer-panel" v-loading="treeSelectDialogService.loading">
        <!-- 左侧顶部，可勾选是否全选 -->
        <p class="dtsd-transfer-panel-header">
          <te-checkbox
            size="small"
            v-model="treeSelectDialogService.checkAll"
            :indeterminate="treeSelectDialogService.isIndeterminate"
            @change="treeSelectDialogService.handleCheckAllChange"
          >
            全部科室
          </te-checkbox>
          <span
            >{{ treeSelectDialogService.selectedIds?.length }}/{{ treeSelectDialogService.allTreeNodes?.length }}</span
          >
        </p>
        <div class="dtsd-transfer-panel-body">
          <!-- 搜索 -->
          <te-input type="text" placeholder="请输入关键词" v-model="treeFilterText" />
          <!-- 树节点 -->
          <te-tree
            v-show="!treeSelectDialogService.loading && mapTreeShow()"
            ref="treeRef"
            show-checkbox
            :check-strictly="true"
            :node-key="DTSD_TREE_KEY"
            :props="DTSD_TREE_PROPS"
            :default-expanded-keys="treeSelectDialogService.expandedKeys"
            :default-checked-keys="treeSelectDialogService.selectedIds"
            :data="treeSelectDialogService.departmentTreeList"
            :filter-node-method="handleTreeFilter"
            @check="treeSelectDialogService.handleTreeCheck"
          >
            <!-- 自定义节点 -->
            <template #default="{ node, data }">
              <span :title="data[DTSD_TREE_PROPS.label]" v-html="formatTreeLabel(data[DTSD_TREE_PROPS.label])"> </span>
            </template>
          </te-tree>
          <no-data
            :height="60"
            :imgUrl="require('../../../../assets/img/common/common-data-none.svg')"
            v-show="!treeSelectDialogService.loading && !mapTreeShow()"
          ></no-data>
        </div>
      </div>
      <!-- 右侧-选中节点面板 -->
      <div class="dtsd-transfer-panel" v-loading="treeSelectDialogService.loading">
        <p class="dtsd-transfer-panel-header">已选科室</p>
        <div class="dtsd-transfer-panel-body">
          <dtsd-selected-list
            v-if="!treeSelectDialogService.loading"
            :list="treeSelectDialogService.selectedList"
            @clear="() => treeSelectDialogService.clear()"
            @remove-item="treeSelectDialogService.handleSelectItemDelete"
          ></dtsd-selected-list>
        </div>
      </div>
    </div>
    <!-- 底部按钮 -->
    <template #footer>
      <te-button @click="treeSelectDialogService.close()">取消</te-button>
      <te-button type="primary" @click="handleSubmit">确定</te-button>
    </template>
  </te-dialog>
</template>
<script lang="ts" setup>
// 公共库
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { mapGetters, useStore } from 'vuex';
// 组件
import { TeButton, TeDialog, TeInput, TeCheckbox, TeTree } from '@tiansu/element-plus';
import DtsdSelectedList from './dtsd-selected-list/dtsd-selected-list.vue';
// 数据服务
import treeSelectDialogService from './da-tree-select-dialog.service';
import departmentAssessmentService from '../department-assessment.service';
import { DTSD_TREE_PROPS, DTSD_TREE_KEY } from './da-tree-select-dialog.api';
import { Common_IObject } from '../../../../services/common/common-api';
// 可观察对象
const destroy$ = new Subject<void>();
// 树
const treeRef = ref();
// 选中的节点
const selectedTreeIdList = ref<number[]>([]);
// 过滤文本
const treeFilterText = ref<string>('');
// store
const store = useStore();
// 配置信息
const configureInfo = computed(mapGetters(['configureInfo']).configureInfo.bind({ $store: store }));
/**
 * 是否展示树
 * @returns {boolean}
 */
const mapTreeShow = (): boolean => {
  return treeSelectDialogService.departmentTreeList?.length !== 0;
};
/**
 * 过滤树节点
 * @param {string} value
 * @param {Common_IObject} data
 * @returns {boolean}
 */
const handleTreeFilter = (value: string, data: Common_IObject) => {
  if (!value) return true;
  return data.treeName.includes(value);
};
/**
 * 树搜索-处理节点文本高亮
 * @param {string} label
 * @returns {string}
 */
const formatTreeLabel = (label: string): string => {
  return !treeFilterText.value ? label : label.replaceAll(treeFilterText.value, `<em>${treeFilterText.value}</em>`);
};
/**
 * 提交保存
 */
const handleSubmit = async () => {
  const res = await treeSelectDialogService.handleSelectedTreeSave();
  if (res) {
    departmentAssessmentService.saveOperationAndQuery(configureInfo.value.showFlag, true);
  }
};
/**
 * 监听过滤文本
 */
watch(
  () => treeFilterText.value,
  (val: string) => {
    treeRef.value!.filter(val);
  },
);
/**
 * 初始化-订阅数据
 * 设置树节点高亮
 */
onMounted(() => {
  treeSelectDialogService.selectedTreeIds$.pipe(takeUntil(destroy$)).subscribe((v) => {
    selectedTreeIdList.value = [...v];
    treeFilterText.value = '';

    nextTick(() => {
      if (treeRef.value) {
        treeRef.value?.setCheckedKeys(selectedTreeIdList.value, false);
      }
    });
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
.da-tree-select-dialog {
  .dtsd-transfer {
    width: 100%;
    height: 480px;
    overflow: hidden;

    display: grid;
    grid-template-columns: 480px 272px;
    column-gap: 8px;

    .dtsd-transfer-panel {
      height: 100%;
      overflow-y: hidden;
      border-radius: 4px;
      border: 1px solid var(--te-border-color-light);
      box-sizing: border-box;
      background: var(--te-bg-color);
      display: flex;
      flex-direction: column;

      .dtsd-transfer-panel-header {
        padding: 9px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--te-fill-color-light);
        color: var(--te-text-color-regular);

        :deep(.te-checkbox) {
          height: 22px;

          .te-checkbox__inner {
            width: 14px;
            height: 14px;
          }

          .te-checkbox__label {
            font-size: var(--te-font-size-b14);
            color: var(--te-text-color-regular);
          }
        }
      }

      .dtsd-transfer-panel-body {
        flex: auto;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        > .te-input {
          padding: 16px;
          width: 100%;
        }

        :deep(.te-tree) {
          flex: 1 1 0%;
          overflow: auto;

          .te-tree-node {
            width: fit-content;
            min-width: 100%;
          }

          .te-tree-node__content {
            // 只有叶子节点展示勾选
            .te-icon.te-tree-node__expand-icon:not(.is-leaf) + .te-checkbox {
              display: none;
            }

            span em {
              font-style: normal;
              color: var(--te-color-primary);
            }
          }
        }

        :deep(.no-data) {
          img {
            display: none;
          }
        }
      }
    }
  }
}
</style>
