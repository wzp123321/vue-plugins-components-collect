<template>
  <div class="te-layout-tree">
    <te-layout-drag leftIconTop="50px" :isShowExpand="showSideExpand">
      <template #left-top>
        <div class="tlt-content-wrap" v-show="showLayout" ref="treeLayout">
          <div class="tlt-content">
            <div class="tlt-content-title">
              <slot name="title">
                <div class="tlt-content-title-text">{{ title }}</div>
              </slot>
              <slot name="add-plus">
                <te-icon
                  v-if="showAddBtn"
                  class="tlt-content-title-btn"
                  @click="addItem"
                >
                  <icon-plus />
                </el-icon>
              </slot>
            </div>
            <slot name="header"></slot>
            <div class="tlt-content-header">
              <te-search
                v-model="searchName"
                @input="inputSearch"
                v-bind="$attrs"
                :placeholder="placeholder"
                class="tlt-content-header-input"
                clearable
              />
              <div class="tlt-content-header-expand" v-if="allExpandBtn">
                <te-button @click="handleExpand()">
                  <te-icon v-if="allExpand"><icon-catalog-expand /></el-icon>
                  <te-icon v-else><icon-catalog-fold /></el-icon>
                </el-button>
              </div>

              <div v-if="levelExpandBtn">
                <te-dropdown @command="handleCommand">
                  <te-button class="tlt-content-header-btn">
                    <el-icon><icon-tree-level /></el-icon>
                    <te-icon class="tlt-content-header-btn-left"
                      ><icon-down
                    /></el-icon>
                  </el-button>

                  <template #dropdown>
                    <te-dropdown-menu v-if="levelNum >= 1">
                      <template
                        v-for="(_item, index) in Array(levelNum - 1)"
                        :key="index"
                      >
                        <te-dropdown-item :command="String(index + 1)"
                          >第{{ index + 1 }}级</te-dropdown-item
                        >
                      </template>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div class="tlt-content-list">
              <slot
                name="content"
                v-bind="{ searchValue, allExpand, levelExpand }"
              ></slot>
            </div>
          </div>
        </div>
      </template>
      <template #right-bottom>
        <slot name="right-content"></slot>
      </template>
    </te-layout-drag>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { TeSearch } from '../../te-search';
import { TeLayoutDrag } from '../../te-layout-drag';
import {
  IconPlus,
  IconCatalogExpand,
  IconCatalogFold,
  IconDown,
  IconTreeLevel,
  IconCaretRight,
  IconCaretLeft,
} from '@arco-iconbox/vue-te';
import {
  ElIcon,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from 'element-plus';

interface Tree {
  [key: string]: any;
}

const props = withDefaults(
  defineProps<{
    title?: string; //标题
    showSideExpand?: boolean; //是否展示侧边整体收缩展开
    showAddBtn?: boolean; //是否展示新增按钮
    placeholder?: string; //搜索框描述
    allExpandBtn?: boolean; //全部展开
    levelExpandBtn?: boolean; //第n级展开
    treeData?: Tree[];
    childrenName?: string; //children字段的别名
  }>(),
  {
    title: '类别',
    showSideExpand: true,
    showAddBtn: true,
    placeholder: '请输入关键字',
    allExpandBtn: true,
    levelExpandBtn: true,
    treeData: () => {
      return [];
    },
    childrenName: 'children',
  },
);

/**
 * 新增按钮点击
 */
const emit = defineEmits([
  'addItem',
  'inputSearch',
  'handleAllExpand',
  'handleLevelExpand',
]);
const addItem = () => {
  emit('addItem');
};

/**
 * 搜索
 */
const searchName = ref('');
const searchValue = ref('');
const inputSearch = (val: string) => {
  searchValue.value = val;
  emit('inputSearch', val);
};

/**
 * tree全部层级折叠/收缩
 */
const allExpand = ref(false);
const handleExpand = () => {
  allExpand.value = !allExpand.value;
  emit('handleAllExpand', allExpand.value);
  //操作全部折叠时，将指定层级置为0
  levelExpand.value = '0';
  emit('handleLevelExpand', '0');
};

/**
 * tree 指定层级展开/折叠
 */
const levelExpand = ref('');
const handleCommand = (val: string) => {
  levelExpand.value = val;
  emit('handleLevelExpand', val);
};

const levelNum = computed(() => getMaxFloor(props.treeData) || 1);

/**
 * 获取树的最深层级
 * @param treeData
 */
const getMaxFloor = (treeData: Tree[] = []) => {
  let childrenName = props.childrenName;
  let max = 0;
  const each = (data: Tree[] = [], floor: number) => {
    data.forEach((e) => {
      e.floor = floor;
      if (floor > max) {
        max = floor;
      }
      if (e[childrenName] && e[childrenName].length > 0) {
        each(e[childrenName], floor + 1);
      }
    });
  };
  each(treeData, 1);
  return max;
};

/**
 * 布局作为整体，侧边栏展开/收缩
 */
const showLayout = ref(true);
const handleShowLayout = () => {
  showLayout.value = !showLayout.value;
};

const showLayoutShrink = ref(false);
/**
 * 在元素被插入到 DOM 之前被调用
 */
const handleBeforeEnter = () => {
  showLayoutShrink.value = false;
};

/**
 * 在折叠动画过渡完成
 * 且元素已从 DOM 中移除时调用的钩子函数，展示空白条
 */
const handleAfterLeave = () => {
  showLayoutShrink.value = true;
};

/**
 * 计算组件高度，使得侧边折叠前后高度一致
 */
const treeLayout = ref(null);
const shrinkStyle = computed(() => {
  return {
    minHeight: treeLayout.value?.clientHeight + 'px',
  };
});
/**
 * 清空树模糊搜索内容
 */
const clearSearch = () => {
  searchName.value = '';
  searchValue.value = '';
};

defineExpose({
  clearSearch,
});
</script>
<style scoped lang="less">
:deep(.tlt-content::-webkit-scrollbar) {
  width: 0;
}
.te-layout-tree {
  position: relative;
  display: inline-flex;
  flex-direction: row;
  height: 100%;
  width: 100%;

  .tlt-content-wrap {
    position: relative;
    border-right: 1px solid var(--te-border-color-lighter);
    box-sizing: content-box;
    overflow-x: hidden;
    width: 100%;
    // 使用element-plus中的下拉菜单dropdown,hover后出现一个黑框，去掉这个黑框
    :deep(:focus-visible) {
      outline: none;
    }
    .tlt-content {
      margin: 20px 20px 0 20px;
      height: calc(100% - 20px);
      flex: 1;
      overflow-x: hidden;
      .tlt-content-title {
        color: var(te-text-color-primary);
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        .tlt-content-title-text {
          font-weight: 600;
          font-size: 16px;
          line-height: 24px;
          flex-shrink: 0;
        }
        .tlt-content-title-btn {
          cursor: pointer;
        }
      }
      .tlt-content-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-top: 16px;

        :deep(.te-button) {
          padding-left: 8px;
          padding-right: 8px;
        }
        .tlt-content-header-input {
          margin: 0;
        }
        .tlt-content-header-expand {
          margin-left: 5px;
        }
        .tlt-content-header-btn {
          margin-left: 5px;
        }
        .tlt-content-header-btn-left {
          margin-left: 5px;
        }
      }

      .tlt-content-list {
        margin-top: 8px;
      }
    }
  }

  .tlt-shrink {
    width: 24px;
    border-right: 1px solid var(--te-border-color-lighter);
  }

  .tlt-collapse-btn {
    position: relative;
    top: 24px;
    right: 0;
    width: 14px;
    height: 104px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--te-border-color-lighter);
    border-left: 0px;
    border-radius: 0 4px 4px 0px;
    cursor: pointer;
  }

  .slide-tree-enter-active {
    animation: bounce-in 0.8s;
  }
  .slide-tree-leave-active {
    animation: bounce-in 0.8s reverse;
  }
  @keyframes bounce-in {
    0% {
      width: 24px;
    }
    100% {
      width: 100%;
    }
  }
}
</style>
