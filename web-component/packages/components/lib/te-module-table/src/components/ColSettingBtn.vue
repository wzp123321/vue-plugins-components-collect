<template>
  <div v-if="columns">
    <te-popover
      @hide="hide"
      popper-class="popover-colSetting"
      placement="bottom-end"
      width="auto"
      trigger="click"
    >
      <template #reference>
        <te-button style="width: 34px; height: 32px">
          <el-icon>
            <Setting />
          </el-icon>
        </el-button>
      </template>

      <TransitionGroup name="list" tag="div" class="container">
        <div
          :class="item.disabled ? 'noMove' : 'move'"
          v-for="(item, index) in columns"
          :key="item.prop"
          draggable="true"
          @dragstart="dragstart($event, index)"
          @dragenter="dragenter($event, index)"
          @dragend="dragend"
          @dragover="dragover"
        >
          <img src="../assets/img/rank-left.svg" alt="排序" />
          <te-checkbox
            v-model="item.checked"
            :label="item.label"
            :disabled="item.disabled"
            @change="checkedChange"
          ></el-checkbox>
          <div
            v-if="item._children && item._children.length > 0"
            class="children-container"
          >
            <div
              :class="child.disabled ? 'noMove' : 'move'"
              v-for="(child, childIndex) in item._children"
              :key="child.prop || childIndex"
              draggable="true"
              @dragstart="dragstartChild($event, index, childIndex)"
              @dragenter="dragenterChild($event, index, childIndex)"
              @dragend="dragendChild"
              @dragover="dragoverChild"
            >
              <img src="../assets/img/rank-left.svg" alt="排序" />
              <te-checkbox
                v-model="child.checked"
                :label="child.label"
                @change="childCheckedChange"
              ></el-checkbox>
            </div>
          </div>
        </div>
      </TransitionGroup>
      <div class="noData" v-if="columns.length === 0">
        <span>暂无有效列</span>
      </div>
    </el-popover>
  </div>
</template>
<script lang="ts" setup name="ColSetting">
import { Setting } from '@element-plus/icons-vue';
import { watch, ref } from 'vue';
import lodash from 'lodash';

let dragIndex = 0;
let dragChildIndex = { parent: 0, child: 0 };
let isInitialChildDrag = false;
let isDragging = false; // 标记是否正在进行任何拖拽操作
let isParentDragging = false; // 新增标记，专门用于标记父元素是否正在拖拽
let isChildDragging = false; // 新增标记，专门用于标记子元素是否正在拖拽

// 父元素拖拽开始
function dragstart(e: any, index: number) {
  e.stopPropagation();
  dragIndex = index;
  isDragging = true;
  isParentDragging = true; // 标记父元素开始拖拽
  setTimeout(() => {
    e.target.classList.add('moveing');
  }, 0);
}

// 父元素拖拽进入
const dragenter = lodash.debounce((e: any, index: any) => {
  e.preventDefault();
  if (dragIndex !== index && isParentDragging) {
    // 只有父元素正在拖拽且目标位置不同时才执行交换逻辑
    const source = columns.value[dragIndex];
    columns.value.splice(dragIndex, 1);
    columns.value.splice(index, 0, source);
    dragIndex = index;
  }
}, 100);

// 父元素拖拽结束
function dragend(e: any) {
  e.target.classList.remove('moveing');
  isDragging = false;
  isParentDragging = false; // 标记父元素拖拽结束
}

// 父元素拖拽悬停
function dragover(e: any) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

// 子元素拖拽开始
function dragstartChild(e: any, parentIndex: number, childIndex: number) {
  e.stopPropagation();
  e.stopImmediatePropagation();
  dragChildIndex = { parent: parentIndex, child: childIndex };
  isInitialChildDrag = true;
  isDragging = true;
  isChildDragging = true; // 标记子元素开始拖拽
  setTimeout(() => {
    e.target.classList.add('moveing');
  }, 0);
}

// 子元素拖拽进入
const dragenterChild = lodash.debounce(
  (e: any, parentIndex: number, childIndex: number) => {
    e.stopImmediatePropagation();
    e.preventDefault();
    const parent = columns.value[parentIndex];
    if (
      parent._children &&
      dragChildIndex.parent === parentIndex &&
      dragChildIndex.child !== childIndex &&
      !isInitialChildDrag &&
      isChildDragging // 只有子元素正在拖拽且不是初始化拖拽时执行交换逻辑
    ) {
      const source = parent._children[dragChildIndex.child];
      parent._children.splice(dragChildIndex.child, 1);
      parent._children.splice(childIndex, 0, source);
      dragChildIndex.child = childIndex;
    }
    isInitialChildDrag = false;
  },
  100,
);

// 子元素拖拽结束
function dragendChild(e: any) {
  e.stopImmediatePropagation();
  e.target.classList.remove('moveing');
  isDragging = false;
  isChildDragging = false; // 标记子元素拖拽结束
  isInitialChildDrag = false;
}

// 子元素拖拽悬停
function dragoverChild(e: any) {
  e.stopImmediatePropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  isInitialChildDrag = false;
}

const emits = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {
      return [];
    },
  },
  saveApi: {
    type: Function,
    required: false,
  },
  saveParam: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const columns = ref<any>();

watch(
  () => props.modelValue,
  (val: any) => {
    columns.value = val;
  },
  { deep: true, immediate: true },
);

// 处理表头选中状态改变
const checkedChange = (e: any) => {
  emits('update:modelValue', columns.value);
};

// 处理子元素显示隐藏状态改变
const childCheckedChange = () => {
  emits('update:modelValue', columns.value);
};

const hide = () => {
  saveColumn();
};

const saveColumn = () => {
  let columnWithoutOperation = columns.value.filter((item: any) => {
    return item.prop != 'operation';
  });

  columnWithoutOperation.forEach((parentItem: any, parentIndex: number) => {
    if (parentItem._children && parentItem._children.length > 0) {
      // 过滤掉隐藏的子元素
      parentItem._children = parentItem._children.filter(
        (childItem: any) => childItem.checked,
      );
      parentItem._children.forEach((childItem: any, childIndex: number) => {
        childItem.order = childIndex + 1;
      });
    }
    parentItem.order = parentIndex + 1;
  });

  if (!props.saveApi) return;

  let paramsColumns = JSON.parse(JSON.stringify(columnWithoutOperation));
  paramsColumns.forEach((v: any) => delete v.filterProp);
  const params = {
    columns: paramsColumns,
  };
  console.log({ ...props.saveParam, ...params });
  props.saveApi({ ...props.saveParam, ...params });
};
</script>
<style lang="less" scoped>
.popover-colSetting {
  padding: 8px 0 !important;
  max-width: 188px;
  max-height: 500px;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 0.35rem;
  }

  .noData {
    text-align: center;
    color: lightgrey;
  }
}

.move {
  display: block; // 修改为块级元素，使其占满一行，便于实现上下分布
  cursor: move;
  padding-left: 8px;

  .te-checkbox {
    margin-left: 8px;
    cursor: move;
  }

  img {
    visibility: hidden;
    position: relative;
    top: -3px;
  }
}

.noMove {
  display: block; // 修改为块级元素，使其占满一行，便于实现上下分布
  cursor: move;
  padding-left: 8px;

  .te-checkbox {
    margin-left: 8px;
  }

  img {
    visibility: hidden;
    position: relative;
    top: -3px;
  }
}

.move:hover {
  background-color: rgba(232, 244, 255, 1);

  img {
    visibility: visible;
    position: relative;
    top: -3px;
  }
}

.container {
  position: relative;
  padding: 0;
}

.moveing {
  opacity: 0;
  cursor: move;
}

.list-move, /* 对移动中的元素应用的过渡 */
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
  cursor: move;
}

.children-container {
  padding-left: 8px;
}

.children-container.move,
.children-container.noMove {
  padding: 4px 0;
  margin-left: 0; // 清除之前设置的左缩进，因为要实现上下分布，不需要水平方向的缩进了
  display: block; // 修改为块级元素，使其占满一行，实现上下分布
}

.children-container.move img,
.children-container.noMove img {
  display: block; // 图片元素也设置为块级元素，占满一行
  margin-bottom: 4px; // 设置图片元素下方的间距，让其与下方文本有间隔
}

.children-container.move span,
.children-container.noMove span {
  display: block; // 文本元素设置为块级元素，占满一行，与图片元素上下分布
}
</style>
