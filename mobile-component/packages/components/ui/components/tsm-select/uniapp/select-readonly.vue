/** * SelectReadonly 只读展示层 * @description tsm-select 内部子组件，readonly 状态下展示选中文本，支持单行溢出展开收起
*/
<template>
  <view class="tsm-select-readonly" :class="{ 'tsm-select-readonly--expanded': isExpanded }">
    <!-- 折叠态：flex 布局，文字单行省略，展开按钮在右侧 -->
    <template v-if="!isExpanded">
      <view ref="textRef" class="tsm-select-readonly__text">{{ text }}</view>
      <text v-if="isOverflowed" class="tsm-select-readonly__btn" @tap.stop="handleExpand">展开</text>
    </template>

    <!-- 展开态：按钮嵌套在 text 内部，与文字处于同一文本流 -->
    <template v-else>
      <text class="tsm-select-readonly__fulltext">
        {{ text }}<text class="tsm-select-readonly__btn" @tap.stop="handleCollapse"> 收起</text>
      </text>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';

interface SelectReadonlyProps {
  text: string;
}

const props = withDefaults(defineProps<SelectReadonlyProps>(), {
  text: '',
});

const textRef = ref<any>(null);
const isExpanded = ref(false);
const isOverflowed = ref(false);

const handleExpand = (): void => {
  isExpanded.value = true;
};

const handleCollapse = (): void => {
  isExpanded.value = false;
};

const getEl = (): HTMLElement | null => {
  const v = textRef.value;
  if (!v) return null;
  // uni-app 中 ref 可能返回组件实例（.$el）或裸 DOM 元素
  return (v.$el || v) as HTMLElement | null;
};

const checkOverflow = (): void => {
  const el = getEl();
  if (!el) return;
  isOverflowed.value = el.scrollWidth > el.clientWidth;
};

watch(
  () => props.text,
  () => {
    isExpanded.value = false;
    // nextTick 仅保证 VNode 更新，setTimeout 0 再推一个宏任务等浏览器 layout 完成
    nextTick(() => setTimeout(checkOverflow, 0));
  },
  { immediate: true }
);

let observer: ResizeObserver | null = null;

const setupObserver = (): void => {
  const el = getEl();
  if (!el) return;
  // App 环境无 ResizeObserver，降级为 window.resize
  if (typeof ResizeObserver !== 'undefined') {
    if (observer) observer.disconnect();
    observer = new ResizeObserver(() => checkOverflow());
    observer.observe(el);
  } else {
    window.addEventListener('resize', checkOverflow);
  }
};

onMounted(() => {
  nextTick(setupObserver);
});

// 从展开态切回折叠态时，textRef 指向新 DOM，需重新绑定 observer
watch(isExpanded, expanded => {
  if (!expanded) {
    nextTick(() => {
      setupObserver();
      checkOverflow();
    });
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  } else {
    window.removeEventListener('resize', checkOverflow);
  }
});
</script>

<style scoped lang="scss">
.tsm-select-readonly {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  min-height: 40px;
  width: 100%;
  border-radius: var(--tsm-radius-m);
  background-color: var(--tsm-color-bg-white);
  box-sizing: border-box;
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-l);
}

// 展开态：block 容器，内部 text 元素行内排列
.tsm-select-readonly--expanded {
  display: block;
}

// 折叠态文字：flex 子项，单行省略
.tsm-select-readonly__text {
  flex: 1 1 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0; // flex 子项默认 min-width 为 auto，设 0 才能触发省略
  color: var(--tsm-color-text-primary);
  word-break: break-word;
}

// 展开态文字：正常换行，行内元素
.tsm-select-readonly__fulltext {
  color: var(--tsm-color-text-primary);
  word-break: break-word;
}

.tsm-select-readonly__btn {
  flex-shrink: 0;
  color: var(--tsm-color-primary);
  white-space: nowrap;
}
</style>
