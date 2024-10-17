<template>
  <div id="ems-pagination">
    <div>
      <label>共{{ total }}条</label>
    </div>

    <div class="tool-group">
      <button title="上一页" icon :disabled="!canLeft()" @click="jumpLeft(1)">
        <i class="ems-iconfont icon-left"></i>
      </button>

      <button radio :selected="1 === index" @click="selectPage(1)">
        {{ 1 }}
      </button>
      <button
        v-if="canJumpLeft()"
        title="向前5页"
        icon
        class="cp-no-border"
        @click="jumpLeft(5)"
        @mouseover="setJumpLeftActive(true)"
        @mouseout="setJumpLeftActive(false)"
      >
        <i v-if="!isJumpLeftActive" class="ems-iconfont icon-shenglvehao"></i>
        <i v-if="isJumpLeftActive" class="ems-iconfont icon-doubleleft"></i>
      </button>

      <button v-for="page in pageList()" radio :selected="page === index" @click="selectPage(page)">
        {{ page }}
      </button>

      <button
        v-if="canJumpRight()"
        title="向后5页"
        class="cp-no-border"
        icon
        @click="jumpRight(5)"
        @mouseover="setJumpRightActive(true)"
        @mouseout="setJumpRightActive(false)"
      >
        <i v-if="!isJumpRightActive" class="ems-iconfont icon-shenglvehao"></i>
        <i v-if="isJumpRightActive" class="ems-iconfont icon-a-doubleright"></i>
      </button>
      <button v-if="pageCount() > 1" radio :selected="pageCount() === index" @click="selectPage(pageCount())">
        {{ pageCount() }}
      </button>

      <button title="下一页" icon :disabled="!canRight()" @click="jumpRight(1)">
        <i class="ems-iconfont icon-Right"></i>
      </button>

      <el-select class="tool-select-size" :popper-append-to-body="false" v-model="size" @change="selectPageSize">
        <el-option v-for="option of pageSizeOptions" :label="option.label" :value="option.value"></el-option>
      </el-select>

      <label>跳至</label>
      <input
        v-inputFilter:positiveNumber
        :value="index"
        class="tool-input-index"
        @keydown.enter="handleKeyDown"
        @blur="jumpToPage($event)"
      />
      <label>页</label>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, watch, onMounted, PropType } from 'vue';

const emit = defineEmits(['update:currentPage', 'update:pageSize', 'size-change', 'current-change']);
const props = defineProps({
  // 当前页码
  currentPage: {
    type: Number,
    default: 1,
  },
  // 当前页面条数
  pageSize: {
    type: Number,
    default: 10,
  },
  // 总数
  total: {
    type: Number,
    default: 0,
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default: [10, 20, 30, 40, 50],
  },
});
// 总数
const total = computed(() => {
  return props.total;
});
// 下拉
const pageSizeOptions = computed(() => {
  return props.pageSizes.map((v) => {
    return { label: `${v}条/页`, value: v };
  });
});

const index = ref<number>(1);
const size = ref<number>(props.pageSizes?.[0] ?? 10);
const isJumpLeftActive = ref<boolean>(false);
const isJumpRightActive = ref<boolean>(false);
// 总页数
const pageCount = () => {
  return Math.ceil(props.total / props.pageSize);
};
/**
 * 设置页码
 */
const setIndex = (v: number) => {
  index.value = v < 1 ? 1 : v > pageCount() ? pageCount() : v;
  emit('update:currentPage', index.value);
  emit('current-change', index.value);
};
/**
 * 是否可减页码
 */
const canLeft = (): boolean => {
  return index.value > 1;
};
/**
 * 是否可加页码
 */
const canRight = (): boolean => {
  return index.value < pageCount();
};
/**
 * 是否左可跳多页
 */
const canJumpLeft = () => {
  const state = pageCount() > 7 && index.value > 4;
  if (!state) {
    isJumpLeftActive.value = false;
  }
  return state;
};
/**
 * 是否可右跳多页
 */
const canJumpRight = () => {
  const state = pageCount() > 7 && index.value < pageCount() - 3;
  if (!state) {
    isJumpRightActive.value = false;
  }
  return state;
};
/**
 * 过去页码数组
 */
const pageList = (): number[] => {
  if (pageCount() > 7) {
    if (index.value < 4) {
      return [2, 3, 4, 5];
    } else if (pageCount() - 3 < index.value) {
      return [pageCount() - 4, pageCount() - 3, pageCount() - 2, pageCount() - 1];
    } else {
      return [index.value - 2, index.value - 1, index.value, index.value + 1, index.value + 2];
    }
  } else {
    return Array.from({ length: pageCount() - 2 }, (_v, k) => k + 2);
  }
};
/**
 * 跳页
 */
const selectPage = (idx: number) => {
  if (idx !== index.value) {
    index.value = idx;
    emit('update:currentPage', index.value);
    emit('current-change', index.value);
  }
};
/**
 * 切换条数
 */
const selectPageSize = (value: number) => {
  size.value = value;

  emit('update:pageSize', size.value);
  emit('size-change', size.value);

  if (index.value > pageCount()) {
    index.value = pageCount();
    emit('update:currentPage', index.value);
    emit('current-change', index.value);
  }
};
/**
 * 回车
 */
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.target) {
    (e.target as HTMLInputElement)?.blur();
  }
};
/**
 * 跳转指定页码
 */
const jumpToPage = (event: Event) => {
  const element = event.target as HTMLInputElement;
  if (checkJumpVerification(element.value)) {
    if (index.value !== +element.value) {
      index.value = +element.value;
      element.value = index.value.toString();
      emit('update:currentPage', index.value);
      emit('current-change', index.value);
    }
  } else {
    element.value = '';
  }
};
/**
 * 左跳一页
 */
const jumpLeft = (count = 1) => {
  index.value -= count;
  setIndex(index.value);
};
/**
 * 右跳一页
 */
const jumpRight = (count = 1) => {
  index.value += count;
  setIndex(index.value);
};
const setJumpLeftActive = (state: boolean) => {
  isJumpLeftActive.value = state;
};
const setJumpRightActive = (state: boolean) => {
  isJumpRightActive.value = state;
};
/**
 * 校验输入框是否合法
 */
const checkJumpVerification = (value: string) => {
  const reg = new RegExp(/^\-?[0-9]+$/);
  const min = 1;
  const max = pageCount();
  if (reg.test(value)) {
    return !(+value < (min ?? undefined)) && !(+value > (max ?? undefined));
  }
  return false;
};
watch(
  () => props.pageSize,
  (newVal) => {
    size.value = newVal;
  },
);
watch(
  () => props.currentPage,
  (newVal) => {
    index.value = newVal;
  },
);
watch(
  () => props.total,
  () => {
    if (index.value > pageCount() && pageCount() !== 0) {
      setIndex(index.value);
    }
    if (pageCount() === 0) {
      emit('current-change', 1);
    }
  },
);

onMounted(() => {
  size.value = props.pageSize;
  index.value = props.currentPage;
});
</script>
<style lang="less" scoped>
#ems-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-top: 10px;

  & > .tool-group {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px !important;

    button + button {
      margin-left: 0 !important;
    }

    button[icon].cp-no-border {
      i {
        color: rgba(0, 0, 0, 0.65);
      }

      &:enabled:hover {
        i {
          color: var(--color-primary);
        }
      }
      // border: 1px transparent;
    }

    & > .tool-select-size {
      width: 97px;
    }

    & > .tool-input-index {
      width: 56px;
    }
  }
}
</style>
