/** * StepsItem 步骤项组件 * @description 步骤项组件，用于显示单个步骤 */
<template>
  <view
    class="tsm-steps-item"
    :class="[bemClass, `tsm-steps-item--${stepsContext?.props.direction || 'horizontal'}`]"
    :style="customStyle"
  >
    <!-- 横向布局 -->
    <template v-if="stepsContext?.props.direction === 'horizontal'">
      <view class="tsm-steps-item-top">
        <!-- 连接线-前半段 -->
        <view class="tsm-steps-item-line" :class="bemLeftLineClass"></view>
        <!-- 序号/图标 -->
        <view class="tsm-steps-item-node" v-if="stepsContext?.props.simple"> </view>
        <view class="tsm-steps-item-node" v-else>
          <icon-check class="tsm-steps-item-node-icon" v-if="computedStatus === 'success'" />
          <icon-close class="tsm-steps-item-node-icon" v-else-if="computedStatus === 'error'" />
          <text v-else class="tsm-steps-item-node-text">{{ itemIndex }}</text>
        </view>

        <!-- 连接线-后半段 -->
        <view
          v-if="showLine"
          class="tsm-steps-item-line"
          :class="{ 'tsm-steps-item--lastline': itemIndex === (stepsContext?.totalItems.value || 0) - 1 }"
        ></view>
      </view>
      <!-- 内容 -->
      <view class="tsm-steps-item-content">
        <view v-if="title" class="tsm-steps-item-title">{{ title }}</view>
        <view v-if="description" class="tsm-steps-item-description">{{ description }}</view>
      </view>
    </template>

    <!-- 竖向布局 -->
    <template v-else>
      <view class="tsm-steps-item-left">
        <!-- 序号/图标 -->
        <view class="tsm-steps-item-node" v-if="stepsContext?.props.simple"> </view>
        <view class="tsm-steps-item-node" v-else>
          <icon-check class="tsm-steps-item-node-icon" v-if="computedStatus === 'success'" />
          <icon-close class="tsm-steps-item-node-icon" v-else-if="computedStatus === 'error'" />
          <text v-else class="tsm-steps-item-node-text">{{ itemIndex }}</text>
        </view>
        <!-- 连接线 -->
        <view
          v-if="showLine"
          class="tsm-steps-item-line"
          :class="{ 'tsm-steps-item--lastline': itemIndex === (stepsContext?.totalItems.value || 0) - 1 }"
        ></view>
      </view>
      <!-- 内容 -->
      <view class="tsm-steps-item-content">
        <view v-if="title" class="tsm-steps-item-title">{{ title }}</view>
        <view v-if="description" class="tsm-steps-item-description">{{ description }}</view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted, type Ref } from 'vue';
import type { StepsItemProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<StepsItemProps>(), defaultProps);
const stepsContext = inject<{
  props: { current: number; direction: string; simple: boolean };
  setItemIndex: (itemIndex: Ref<number>) => void;
  registerItem: (item: { text: string; description: string; status: string }) => void;
  totalItems: Ref<number>;
  stepItems: Ref<{ text: string; description: string; status: string }[]>;
} | null>('stepsContext', null);

// 组件索引
const itemIndex = ref(0);

// 监听项挂载

onMounted(() => {
  // 可以通过父组件的逻辑来设置itemIndex
  stepsContext?.setItemIndex(itemIndex);
  stepsContext?.registerItem({
    text: props.title || '',
    description: props.description || '',
    status: computedStatus.value || '',
  });
});

// 计算状态
const computedStatus = computed(() => {
  if (props.status) {
    return props.status;
  }
  if (!stepsContext) {
    return 'unstart';
  }
  const current = stepsContext.props.current;
  const index = itemIndex.value;
  if (index < current) {
    return 'success';
  } else if (index === current) {
    return 'inactive';
  } else {
    return 'unstart';
  }
});
// 上一个步骤状态
const prevItemStatus = computed(() => {
  return stepsContext?.stepItems.value[itemIndex.value - 1 - 1]?.status || '';
});

// 是否显示连接线
const showLine = computed(() => {
  return true;
});

const bemClass = computed(() => {
  return bem('steps-item', [computedStatus.value, stepsContext?.props.simple ? 'simple' : ''], [], props.customClass);
});
const bemLeftLineClass = computed(() => {
  return bem(
    'steps-item',
    ['prevline-' + prevItemStatus.value, itemIndex.value === 1 ? 'firstline' : ''],
    [],
    props.customClass
  );
});
</script>

<style scoped lang="scss">
.tsm-steps-item--horizontal {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: var(--tsm-spacing-xs);
  .tsm-steps-item-top {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--tsm-spacing-m);
    .tsm-steps-item-node {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      .tsm-steps-item-node-text {
        line-height: 22px;
        font-family: var(--tsm-font-family-regular);
        font-size: var(--tsm-font-size-text-m);
        font-style: normal;
        font-weight: var(--tsm-font-weight-bold);
      }
      .tsm-steps-item-node-icon {
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;

        .tsm-steps-item-node-icon-img {
          width: 100%;
          height: 100%;
        }
      }
    }
    .tsm-steps-item-line {
      flex: 1 1 0;
      height: 1px;
    }
    .tsm-steps-item--firstline,
    .tsm-steps-item--lastline {
      opacity: 0;
    }
  }

  .tsm-steps-item-content {
    width: 100%;
    flex: 0 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: var(--tsm-spacing-none);
    .tsm-steps-item-title {
      text-align: center;
      font-family: var(--tsm-font-family-regular);
      font-size: var(--tsm-font-size-text-m);
      font-style: normal;
      font-weight: var(--tsm-font-weight-bold);
      line-height: var(--tsm-line-height-text-m); /* 157.143% */
    }

    .tsm-steps-item-description {
      color: var(--tsm-color-text-quaternary);
      text-align: center;
      font-family: var(--tsm-font-family-regular);
      font-size: var(--tsm-font-size-text-s);
      font-style: normal;
      font-weight: var(-tsm-font-weight-regular);
      line-height: var(--tsm-line-height-text-s); /* 166.667% */
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
.tsm-steps-item--vertical {
  flex: 1 1 0;
  display: flex;
  align-items: flex-start;
  position: relative;
  margin-bottom: var(--tsm-spacing-m);
  .tsm-steps-item-left {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    .tsm-steps-item-node {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--tsm-spacing-m);

      .tsm-steps-item-node-text {
        line-height: 22px;
        font-family: var(--tsm-font-family-regular);
        font-size: var(--tsm-font-size-text-m);
        font-style: normal;
        font-weight: var(--tsm-font-weight-bold);
      }

      .tsm-steps-item-node-icon {
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .tsm-steps-item-line {
      flex: 1 1 0;
      width: 1px;
    }
  }

  .tsm-steps-item-content {
    flex: 0 1 auto;
    display: flex;
    flex-direction: column;
    gap: var(--tsm-spacing-xs);
    margin-left: var(--tsm-spacing-m);

    .tsm-steps-item-title {
      font-family: var(--tsm-font-family-regular);
      font-size: var(--tsm-font-size-text-m);
      font-style: normal;
      font-weight: var(--tsm-font-weight-bold);
      line-height: var(--tsm-line-height-text-m);
    }

    .tsm-steps-item-description {
      color: var(--tsm-color-text-quaternary);
      font-family: var(--tsm-font-family-regular);
      font-size: var(--tsm-font-size-text-s);
      font-style: normal;
      font-weight: var(-tsm-font-weight-regular);
      line-height: var(--tsm-line-height-text-s);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .tsm-steps-item--lastline {
    display: none;
  }
}
//简洁风格
.tsm-steps-item--simple {
  .tsm-steps-item-node {
    width: 8px !important;
    height: 8px !important;
    // border-width: 1px;
    // border-style: solid;
    background-color: inherit !important;
  }
  .tsm-steps-item-left {
    padding-top: 6px;
  }
}
.tsm-steps-item--success.tsm-steps-item--simple {
  .tsm-steps-item-node {
    box-shadow: 0 0 0 1.5px var(--tsm-color-success);
    // border-width: 1px;
    // border-style: solid;
    background-color: var(--tsm-color-success) !important;
  }
}
.tsm-steps-item--inactive.tsm-steps-item--simple {
  .tsm-steps-item-node {
    box-shadow: 0 0 0 1.5px var(--tsm-color-primary);
  }
}
.tsm-steps-item--inactive.tsm-steps-item--simple {
  .tsm-steps-item-node {
    box-shadow: 0 0 0 1.5px var(--tsm-color-primary);
  }
}
.tsm-steps-item--unstart.tsm-steps-item--simple {
  .tsm-steps-item-node {
    box-shadow: 0 0 0 1.5px var(--tsm-color-text-placeholder);
  }
}
.tsm-steps-item--error.tsm-steps-item--simple {
  .tsm-steps-item-node {
    box-shadow: 0 0 0 1.5px var(--tsm-color-danger);
  }
}
// 已完成状态
.tsm-steps-item--success {
  .tsm-steps-item-node {
    background-color: var(--tsm-color-success-bg);
    .tsm-steps-item-node-icon {
      color: var(--tsm-color-success) !important;
    }
  }
  .tsm-steps-item-line {
    background-color: var(--tsm-color-success);
  }
  .tsm-steps-item-title {
    color: var(--tsm-color-text-primary);
  }
}
// 进行中状态
.tsm-steps-item--inactive {
  .tsm-steps-item-node {
    background-color: var(--tsm-color-primary);
    .tsm-steps-item-node-text {
      color: var(--tsm-color-text-white);
    }
  }
  .tsm-steps-item-line {
    background-color: var(--tsm-color-border-primary);
  }
  .tsm-steps-item-title {
    color: var(--tsm-color-primary);
  }
}
// 未开始状态
.tsm-steps-item--unstart {
  .tsm-steps-item-node {
    background-color: var(--tsm-color-bg-secondary);
    border-color: var(--tsm-color-text-placeholder);
    .tsm-steps-item-node-text {
      color: var(--tsm-color-text-secondary);
    }
  }
  .tsm-steps-item-line {
    background-color: var(--tsm-color-border-primary);
  }
  .tsm-steps-item-title {
    color: var(--tsm-color-text-secondary);
  }
}
// 错误状态
.tsm-steps-item--error {
  .tsm-steps-item-node {
    background-color: var(--tsm-color-danger-border);
    border-color: var(--tsm-color-danger);
    .tsm-steps-item-node-icon {
      color: var(--tsm-color-danger) !important;
    }
  }

  .tsm-steps-item-line {
    background-color: var(--tsm-color-danger);
  }
  .tsm-steps-item-title {
    color: var(--tsm-color-danger);
  }
}
.tsm-steps-item--prevline-success {
  background-color: var(--tsm-color-success) !important;
}
.tsm-steps-item--prevline-error {
  background-color: var(--tsm-color-danger) !important;
}
.tsm-steps-item--prevline-unstart {
  background-color: var(--tsm-color-border-primary) !important;
}
.tsm-steps-item--prevline-inactive {
  background-color: var(--tsm-color-border-primary) !important;
}
</style>
