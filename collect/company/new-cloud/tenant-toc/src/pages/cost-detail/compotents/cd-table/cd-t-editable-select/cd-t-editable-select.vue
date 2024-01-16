<template>
  <el-popover
    :popper-class="`cd-t-editable-select ${customPopoverClass}`"
    :placement="placement"
    :width="triggerWidth"
    :offset="8"
    :show-arrow="false"
    v-model:visible="visible"
    trigger="click"
    @hide="hide"
    @show="handleShow"
  >
    <template #reference>
      <div :class="['cd-t-es-trigger', customTriggerClass]">
        <input type="text" v-model="modelValue" @input="input" maxlength="200" @blur="handleInputBlur" />
        <i :class="['toc-iconfont icon-toc-Down1', visible ? 'expanded' : '']"></i>
      </div>
    </template>
    <ul v-show="list?.length">
      <li
        :title="item"
        v-for="(item, index) in list"
        :key="'li' + index"
        :class="{ selected: item === modelValue }"
        @click="handleSelect(item)"
      >
        {{ item !== '' && item !== null && item !== undefined ? item : '--' }}
      </li>
    </ul>
    <div v-show="list?.length === 0 && visible" class="cd-t-es--nodata">
      <img src="../../../../../assets/images/common/common-data-none.svg" />
      <p>暂无数据</p>
    </div>
  </el-popover>
</template>
<script lang="ts" setup>
import { PropType, watch, ref, computed, nextTick } from 'vue';

import { cloneDeep } from 'lodash';
import { MENU_WIDTH } from '../constant';

const props = defineProps({
  value: {
    type: String,
    defualt: '',
  },
  width: {
    type: String,
    default: '211',
  },
  list: {
    type: Array as PropType<string[]>,
    default: [],
  },
});
const emit = defineEmits(['change', 'update:value', 'visible-change']);

const modelValue = ref<string>(String(props.value));
const visible = ref<boolean>(false);
const list = ref<string[]>(props.list);
const placement = ref<string>('bottom-start');
const triggerWidth = ref<string>('');
let dataSource: string[] = [];
let originValue = ref<string>(String(props.value));

// 独立类名
const customPopoverClass = computed(() => {
  return `popover-select_${Number(Math.random() * 10000).toFixed(0)}`;
});
const customTriggerClass = computed(() => {
  return `popover-trigger_${Number(Math.random() * 10000).toFixed(0)}`;
});

watch(
  () => props.value,
  () => {
    modelValue.value = String(props.value);
    originValue.value = String(props.value);
  }
);

watch(
  () => props.list,
  () => {
    list.value = props.list;
    dataSource = props.list;
  },
  {
    immediate: true,
  }
);

watch(
  () => visible.value,
  (newVal) => {
    if (newVal) {
      getPopoverPlacement();
    }
  }
);

const handleShow = () => {
  triggerWidth.value = props.width;

  const triggerEle = document.querySelector('.cd-t-es-trigger');
  if (triggerEle) {
    triggerWidth.value = getComputedStyle(triggerEle, 'width')?.width;
  }
  emit('visible-change', true);
};

/**
 * 计算展开位置
 */
const getPopoverPlacement = () => {
  nextTick(() => {
    const popover = document.querySelector(`.${customPopoverClass.value}`);
    const trigger = document.querySelector(`.${customTriggerClass.value}`);
    const popoverH = popover?.getBoundingClientRect()?.height ?? 240;

    const top = trigger?.getBoundingClientRect()?.y ?? 0;
    const left = trigger?.getBoundingClientRect()?.x ?? 0;
    const triggerH = trigger?.getBoundingClientRect()?.height ?? 32;

    const sHeight = document.documentElement.clientHeight;

    if (top + triggerH + popoverH < sHeight) {
      placement.value = 'bottom-start';
    } else if (top > popoverH) {
      placement.value = 'top-start';
    } else if (left - MENU_WIDTH - 164 < 211) {
      placement.value = 'right-start';
    } else {
      placement.value = 'left-start';
    }
  });
};

const hide = () => {
  list.value = cloneDeep(dataSource);
};

const select = (value: string) => {
  list.value = cloneDeep(dataSource);
  modelValue.value = value;

  visible.value = false;
};

const input = () => {
  const characters: string = '';
  const defaultStr = String.raw`\\<>`;
  const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
  modelValue.value = modelValue.value.replace(reg, '');
  // 过滤空格
  modelValue.value = modelValue.value.replace(/\s+/g, '');

  list.value = dataSource.filter((item) => {
    return item.includes(String(modelValue.value));
  });
};

const handleInputBlur = () => {
  if (modelValue.value !== originValue.value) {
    emit('update:value', modelValue.value);
    emit('change', modelValue.value);
  }
};

const handleSelect = (value: string) => {
  select(value);
  if (modelValue.value !== originValue.value) {
    emit('update:value', modelValue.value);
    emit('change', modelValue.value);
  }
};
</script>
<style lang="less" scoped>
.cd-t-es-trigger {
  height: 32px;
  width: 100%;

  display: inline-block;

  background-color: #fff;
  border: 1px solid var(--color-text-border);
  border-radius: 4px;

  box-sizing: border-box;

  > input {
    width: calc(100% - 18px);
    height: 30px !important;
    line-height: 30px !important;

    font-size: 14px;
    padding: 0 11px;

    border: none;

    &:focus {
      box-shadow: none !important;
    }
  }

  i.toc-iconfont {
    margin-right: 4px;

    display: inline-block;
    font-size: 14px;
    color: var(--color-text-disable);

    transform: rotate(0deg);
    transition: all 233ms;
  }

  i.toc-iconfont.expanded {
    transform: rotate(180deg);
    transition: all 233ms;
  }
}
</style>
<style lang="less">
.el-popover.el-popper.cd-t-editable-select {
  padding: 0 !important;
  overflow: hidden;
  min-width: 113px;
  z-index: 4 !important;

  ul {
    width: 100%;
    max-height: 238px;
    overflow: auto;

    list-style: none;
    margin-bottom: 0;

    > li {
      display: block;
      list-style: none;

      height: 34px;
      line-height: 34px;

      font-size: 14px;
      color: var(--color-text-primary);

      padding: 0 12px;

      &.selected {
        background-color: rgba(0, 0, 0, 0.02) !important;
        color: var(--color-primary);
      }

      &:not(.selected):hover {
        background-color: var(--color-hover);
        transition: all 233ms;
      }
    }
  }

  .cd-t-es--nodata {
    min-height: 100px;

    display: flex;
    flex-direction: column;

    justify-content: center;
    align-items: center;

    img {
      width: 48px;
      height: 30px;
    }

    p {
      color: var(--color-text-disable);
      font-size: 14px;
      margin-top: 8px;
    }
  }
}
</style>
