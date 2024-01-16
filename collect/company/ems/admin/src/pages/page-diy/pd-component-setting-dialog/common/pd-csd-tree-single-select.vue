<template>
  <!-- 弹框 -->
  <div v-drag>
    <el-dialog
      title="区域节点"
      v-model="dialogFormVisible"
      width="560px"
      :close-on-click-modal="false"
      @close="closeDialog"
    >
      <div class="box flex flex-column">
        <SwitchCheck :switchItems="switchItems" v-model="treeType" @switch-check-change="switchCheck"></SwitchCheck>
        <div class="box-tree" v-loading="getAnalysisTreeDataLoading">
          <el-tree
            v-if="!getAnalysisTreeDataLoading"
            ref="treeRef"
            :data="analysisObjectData"
            :highlight-current="true"
            :node-key="'id'"
            :check-on-click-node="false"
            :expand-on-click-node="false"
            :default-expanded-keys="analysisObjectExpanedKeys"
            :default-expand-all="false"
            :props="{ children: 'childTree', label: 'treeName' }"
            :default-checked-keys="formInline.analysisObject"
            @node-click="onNodeClick"
          >
            <template #default="{ node, data }">
              <div
                :class="[
                  'node-title',
                  data.treeLeaf === '1' ? 'disabled' : formInline.analysisObject.includes(data.id) ? 'current' : '',
                ]"
              >
                {{ data.treeName }}
              </div>
            </template>
          </el-tree>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer" style="text-align: center">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="onSure">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, watch } from 'vue';
import { cloneDeep } from 'lodash';
import CommonService from '../../../../services/common/common';
import { getTreeExpandKeys } from '@/utils';
import message from '@/utils/message';

export default defineComponent({
  props: {
    // 接收父组件中已选中的节点
    selectedTreeNode: {
      type: Array,
      default: [],
    },
    // 选择当前默认tab栏
    selectedCheck: {
      type: Number,
      default: 1,
    },
    // 多选时最多可以选择几个
    maxLength: {
      type: Number,
      default: 10,
    },
  },
  emits: ['setTreeData', 'setChecked'],

  setup(props, { emit }) {
    const switchItems = [
      { code: 1, name: '区域' },
      { code: 2, name: '业态' },
    ];
    const dialogFormVisible = ref<boolean>(false);
    const maxLength = computed(() => {
      return props.maxLength;
    });
    const treeRef = ref();
    const treeType = ref(props.selectedCheck);
    const analysisObjectExpanedKeys = ref<number[]>([]);
    const getAnalysisTreeDataLoading = ref<boolean>(false); //loading
    const formInline = reactive<any>({
      analysisObject: props.selectedTreeNode, //选择中的树节点
    });
    const analysisObjectData = ref<any[]>([]); //存放treeData数据

    // 获取分析对象
    const getAnalysisTreeData = async () => {
      try {
        getAnalysisTreeDataLoading.value = true;
        const res = await CommonService.getEmsTreeListWidthoutLocation({ treeType: treeType.value });
        if (res && res.code === 200 && res.success) {
          analysisObjectData.value = res.data || [];
          analysisObjectExpanedKeys.value = getTreeExpandKeys(analysisObjectData.value, 'id', 'childTree')?.map(
            (item) => {
              return Number(item);
            },
          );
        } else {
          analysisObjectData.value = [];
          analysisObjectExpanedKeys.value = [];
        }
      } catch (error) {
        analysisObjectExpanedKeys.value = [];
        analysisObjectData.value = [];
      } finally {
        getAnalysisTreeDataLoading.value = false;
      }
    };
    // tab切换事件
    const switchCheck = () => {
      getAnalysisTreeData();
    };

    // 关闭弹框
    const closeDialog = () => {
      dialogFormVisible.value = false;
      formInline.analysisObject = [];
    };
    // 确定 传数据
    const onSure = () => {
      const node = treeRef.value.getCurrentNode();
      emit('setTreeData', [
        {
          treeName: node.treeName,
          id: node.id,
        },
      ]);
      emit('setChecked', treeType.value);
      dialogFormVisible.value = false;
    };
    // 打开弹框
    const show = () => {
      dialogFormVisible.value = true;
      formInline.analysisObject = cloneDeep(props.selectedTreeNode);
      treeType.value = cloneDeep(props.selectedCheck);
      getAnalysisTreeData();
    };
    // 节点点击
    const onNodeClick = (data: { [key: string]: any }) => {
      if (data.treeLeaf === '1') {
        return;
      }
      if (formInline.analysisObject.includes(data.id as never)) {
        formInline.analysisObject = [];
      } else {
        formInline.analysisObject = [data.id];
      }
      console.log('%c🚀 ~ pd-csd-tree-single-select.vue ~ 159行', 'font-size: 18px', formInline.analysisObject);
      treeRef.value.setCheckedKeys(formInline.analysisObject, false);
    };

    watch(
      () => props.selectedTreeNode,
      (newVal) => {
        formInline.analysisObject = cloneDeep(newVal);
      },
    );
    watch(
      () => props.selectedCheck,
      (newVal) => {
        treeType.value = newVal;
      },
    );

    return {
      switchItems,
      treeType,
      getAnalysisTreeDataLoading,
      analysisObjectData,
      analysisObjectExpanedKeys,
      formInline,
      dialogFormVisible,
      maxLength,
      treeRef,

      onNodeClick,
      switchCheck,
      onSure,
      closeDialog,
      show,
    };
  },
});
</script>
<style lang="less" scoped>
.box {
  height: 400px;
  overflow: hidden;
  border: 1px solid #dbdbdb;

  .box-tree {
    flex: 1 1 auto;
    overflow-y: auto;
  }

  :deep(.tree-select) {
    margin-top: 16px;
  }
  .node-title {
    padding: 7px 8px;
    border-radius: 4px;
    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
    &.disabled {
      cursor: not-allowed;
      color: #dbdbdb;
      background-color: transparent !important;
    }
  }
  .el-tree-node > .el-tree-node__content .el-checkbox.is-checked + .node-title {
    background-color: var(--color-active) !important;
  }
  .current {
    background-color: var(--color-active) !important;
  }

  .el-tree-node.is-current.is-checked > .el-tree-node__content .node-title {
    background-color: var(--color-active) !important;
    &.disabled {
      cursor: not-allowed;
      background-color: transparent !important;
      color: #dbdbdb;
    }
  }
}
</style>
