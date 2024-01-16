<template>
  <div class="adssa-share-object">
    <div class="adssaso-tree">
      <el-input v-model.trim="shareObjectService.search.value" placeholder="请输入" :suffix-icon="Search"></el-input>
      <el-tree
        v-loading="shareObjectService.loading.value"
        ref="treeRef"
        :data="shareObjectService.shareObject.value"
        node-key="id"
        :props="defaultProps"
        :default-expanded-keys="shareObjectService.expandedKeys.value"
        highlight-current
        show-checkbox
        check-on-click-node
        :check-strictly="true"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        @check="nodeClick"
      ></el-tree>
    </div>
    <div class="adssaso-fast">
      <div class="adssaso-fast-title">快捷选择</div>
      <ul>
        <li
          class="adssaso-li"
          :class="{ 'li-active': item.id === currentQuickSelect }"
          v-for="item in shareObjectService.quickSelect.value"
          @click="quickSelect(item)"
        >
          {{ item.treeName }}
        </li>
      </ul>
    </div>
    <div class="adssaso-footer">
      <el-button type="primary" @click="sure">确定</el-button>
      <el-button @click="cancel">取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShareObjectService } from './adssa-share-object-service';
import { Search } from '@element-plus/icons-vue';
import { watch, ref, PropType, nextTick } from 'vue';
import { TreeItem, ObjectType } from './adssa-share-object-api';
import { cloneDeep } from 'lodash';
import { getTreeExpandKeys } from '@/utils';

const props = defineProps({
  initObjectIds: Object as PropType<string[]>,
  initObjectType: String,
});
const emit = defineEmits(['cancel', 'sure']);
const shareObjectService = new ShareObjectService();
const treeRef = ref();
const defaultProps = {
  children: 'childTree',
  label: 'treeName',
};
const currentQuickSelect = ref<string>('');

// 反显已选择过的数据
Promise.all([shareObjectService.getObjectList(), shareObjectService.getQuickSelectList()]).then(() => {
  const defaultExpanded = getTreeExpandKeys(shareObjectService.shareObject.value, 'id', 'childTree');
  shareObjectService.expandedKeys.value = defaultExpanded;

  if (props.initObjectIds?.length !== 0) {
    if (props.initObjectType === ObjectType.树选择) {
      treeRef.value!.setCheckedKeys(props.initObjectIds);
      props.initObjectIds?.forEach((item) => {
        if (!defaultExpanded.includes(Number(item))) {
          defaultExpanded.push(Number(item));
        }
      });

      setTimeout(() => {
        document.querySelector('.el-tree-node.is-checked .el-tree-node__content')?.scrollIntoView({ block: 'center' });
      }, 666);
    } else {
      currentQuickSelect.value = props.initObjectIds?.[0] || '';
      setTimeout(() => {
        document.querySelector('.li-active')?.scrollIntoView({ block: 'center' });
      }, 666);
    }
  } else {
    shareObjectService.expandedKeys.value = defaultExpanded;
  }
});

watch(shareObjectService.search, (val) => {
  treeRef.value!.filter(val);
});

function filterNode(value: string, data: TreeItem) {
  if (!value) return true;
  return data.treeName.includes(value);
}

function nodeClick() {
  currentQuickSelect.value = '';
}

function quickSelect(item: TreeItem) {
  currentQuickSelect.value = item.id;
  treeRef.value!.setCheckedKeys([]);
  shareObjectService.selectedObject.value = [];
  shareObjectService.selectedObject.value.push({ id: item.id, name: item.treeName, type: ObjectType.快捷选择 });
}

function sure() {
  const treeNodes = treeRef.value!.getCheckedNodes();
  if (treeNodes?.length !== 0) {
    shareObjectService.selectedObject.value = [];
    treeNodes.forEach((item: TreeItem) => {
      shareObjectService.selectedObject.value.push({
        id: item.id,
        name: item.treeName,
        type: ObjectType.树选择,
      });
    });
  }
  emit('sure', cloneDeep(shareObjectService.selectedObject.value));
  emit('cancel');
}
function cancel() {
  emit('cancel');
}
</script>

<style lang="less" scoped>
.adssa-share-object {
  height: 398px;
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: 330px 68px;

  .adssaso-tree {
    display: flex;
    flex-direction: column;
    padding: 16px;
    border-right: 1px solid rgba(217, 217, 217, 1);
    :deep(.el-tree) {
      margin-top: 20px;
      flex: 1;
      overflow: auto;
    }
  }
  .adssaso-fast {
    padding: 16px;
    display: flex;
    flex-direction: column;
    &-title {
      height: 22px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    ul {
      flex: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;
      // gap: 8px;
      li {
        height: 36px;
        padding-left: 8px;
        line-height: 36px;
        cursor: pointer;
        &:hover {
          background-color: rgba(230, 247, 255, 1);
        }
      }
      .li-active {
        background-color: rgba(230, 247, 255, 1);
      }
    }
  }
  .adssaso-footer {
    border-top: 1px solid rgba(217, 217, 217, 1);
    grid-column: 1 / 3;
    text-align: center;
    line-height: 68px;
  }
  :deep(.el-tree) {
    .el-tree-node.is-checked > .el-tree-node__content > .el-tree-node__label {
      background-color: rgba(230, 247, 255, 1) !important;
    }
    .el-tree-node {
      width: fit-content;
      min-width: 100%;
    }
  }
  :deep(.el-input__suffix-inner) {
    display: inline-flex;
    align-items: center;
  }
}
</style>
