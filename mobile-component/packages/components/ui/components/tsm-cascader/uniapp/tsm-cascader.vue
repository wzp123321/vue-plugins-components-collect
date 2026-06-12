<template>
  <view class="tsm-cascader" :class="[customClass]" :style="customStyle">
    <tsm-popup
      mode="bottom"
      :show="show"
      :title="title"
      :closeable="closeable"
      @update:show="onUpdateShow"
      @close="onPopupClose"
    >
      <view class="tsm-cascader__container">
        <!-- Tab 切换区 -->
        <tsm-tabs :list="tabList" :current="activeLevel" key-name="name" :isometric="true" @change="onTabClick" />

        <!-- 选项列表容器（带滑动动效） -->
        <view
          class="tsm-cascader__content-wrapper"
          :style="`width: ${items.length * 100}vw; transform: translateX(-${activeLevel}00vw)`"
        >
          <scroll-view
            v-for="(levelOptions, levelIndex) in items"
            :key="levelIndex"
            class="tsm-cascader__content"
            :scroll-y="true"
          >
            <view
              v-for="(option, index) in levelOptions"
              :key="index"
              class="tsm-cascader__option"
              :class="{
                'tsm-cascader__option--selected': selectedIndexes[levelIndex] === index,
                'tsm-cascader__option--disabled': isOptionDisabled(option),
              }"
              @click="onOptionClick(option, index, levelIndex)"
            >
              <text class="tsm-cascader__option-label">{{ getOptionLabel(option) }}</text>
              <icon-check-medium class="tsm-cascader__option-icon" v-if="selectedIndexes[levelIndex] === index" />
            </view>
            <view v-if="levelOptions.length === 0" class="tsm-cascader__empty">暂无数据</view>
          </scroll-view>
        </view>
      </view>

      <!-- Footer: 仅 checkStrictly 模式显示 -->
      <template #footer>
        <view v-if="checkStrictly" class="tsm-cascader__footer">
          <tsm-button :style="{ width: '100%' }" theme="primary" block :label="confirmText" @click="onConfirm" />
        </view>
      </template>
    </tsm-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import type { CascaderOption, CascaderProps } from './props';
import { defaultProps } from './props';
import type { FormItemContext } from '../../tsm-form-item/uniapp/type';

const props = withDefaults(defineProps<CascaderProps>(), defaultProps);

const emit = defineEmits<{
  /** 值变更事件 */
  (e: 'change', value: { value: string | number; selectedOptions: CascaderOption[] }): void;
  /** 选项点击事件 */
  (e: 'pick', value: string | number, label: string, index: number, level: number): void;
  /** 弹层关闭事件 */
  (e: 'close', value: { trigger: 'overlay' | 'close-btn' | 'finish' }): void;
  /** 同步显示/隐藏状态 */
  (e: 'update:show', value: boolean): void;
  /** 同步选中值 */
  (e: 'update:value', value: string | number): void;
}>();

// 注入 FormItemContext（在 FormItem 内使用时触发验证）
const formItemContext = inject<FormItemContext | null>('formItemContext', null);

// 内部状态
// selectedIndexes[i] = 当前第 i 级的选中索引
const selectedIndexes = ref<number[]>([]);
// items[i] = 第 i 级的选项列表
const items = ref<CascaderOption[][]>([]);
// steps[i] = 第 i 级 Tab 显示的文字
const steps = ref<string[]>([]);
// 当前激活的级别（改为 ref，由点击事件手动更新）
const activeLevel = ref(0);
// 标记是否由关闭按钮触发的关闭（用于区分 overlay 和 close-btn）
let closeTriggeredByCloseBtn = false;

// 根据 keys 配置获取字段值
type CascaderKey = 'label' | 'value' | 'children' | 'disabled';
const getField = (option: CascaderOption, field: CascaderKey) => {
  const key = (props.keys?.[field] || field) as keyof CascaderOption;
  return option[key] as any;
};

const getOptionLabel = (option: CascaderOption) => getField(option, 'label');
const getOptionValue = (option: CascaderOption) => getField(option, 'value');
const getOptionChildren = (option: CascaderOption) => getField(option, 'children') as CascaderOption[] | undefined;
const isOptionDisabled = (option: CascaderOption) => !!getField(option, 'disabled');

// 将 steps 转换为 tsm-tabs 需要的 list 格式
const tabList = computed(() => {
  return steps.value.map(step => ({ name: step || props.placeholder }));
});

// 计算最终选中值和路径
// 获取 selectedIndexes 中最后一个有效选中项的值
const selectedValue = computed(() => {
  const indexes = selectedIndexes.value;
  // 找到最后一个有效的选中索引
  for (let i = indexes.length - 1; i >= 0; i--) {
    if (indexes[i] !== undefined) {
      const option = items.value[i]?.[indexes[i]];
      return option ? getOptionValue(option) : undefined;
    }
  }
  return undefined;
});

// 获取完整的选中选项列表（返回 CascaderOption[]，排除 children 字段）
const getSelectedOptions = (): CascaderOption[] => {
  const options: CascaderOption[] = [];
  const indexes = selectedIndexes.value;
  for (let i = 0; i < indexes.length; i++) {
    const idx = indexes[i];
    if (idx !== undefined && items.value[i]?.[idx]) {
      const option = items.value[i][idx];
      // 排除 children 字段，避免数据过重
      const { children, ...rest } = option as CascaderOption & { children?: CascaderOption[] };
      options.push(rest as CascaderOption);
    }
  }
  return options;
};

// 判断是否为叶子节点
const isLeafNode = (option: CascaderOption) => {
  const children = getOptionChildren(option);
  return !children || children.length === 0;
};

// 初始化：根据 options 构建第一级选项
const init = () => {
  selectedIndexes.value = [];
  items.value = [props.options];
  steps.value = [props.placeholder || '请选择'];
  activeLevel.value = 0;
};

init();

// 监听 show 变化，弹层打开时重新初始化
watch(
  () => props.show,
  newVal => {
    if (newVal) {
      // 重置关闭触发标记
      closeTriggeredByCloseBtn = false;
      // 根据初始值重建选中状态
      if ((props.value !== undefined || props.defaultValue !== undefined) && props.options?.length > 0) {
        initWithValue();
      } else {
        init();
      }
    }
  },
  { immediate: true }
);

// 根据初始值初始化
const initWithValue = () => {
  const targetValue = props.value !== undefined ? props.value : props.defaultValue;
  if (targetValue === undefined) {
    init();
    return;
  }

  // 递归查找目标值在哪个分支，返回路径索引数组
  const findPath = (options: CascaderOption[], path: number[]): number[] | null => {
    for (let i = 0; i < options.length; i++) {
      if (getOptionValue(options[i]) === targetValue) {
        return [...path, i];
      }
      const children = getOptionChildren(options[i]);
      if (Array.isArray(children) && children.length > 0) {
        const result = findPath(children, [...path, i]);
        if (result) return result;
      }
    }
    return null;
  };

  const path = findPath(props.options, []);
  if (!path) {
    init();
    return;
  }

  // 重建状态
  selectedIndexes.value = path;
  items.value = [];
  steps.value = [];

  let curOptions = props.options;
  for (let i = 0; i < path.length; i++) {
    items.value.push([...curOptions]);
    steps.value.push(getOptionLabel(curOptions[path[i]]));
    const children = getOptionChildren(curOptions[path[i]]);
    const childArr = Array.isArray(children) ? children : [];

    // 如果有子级，需要加载下一级选项
    // 对于 path 中中间的节点（i < path.length - 1），用于导航
    // 对于 path 中最后一个节点（非叶子），需要展开下一级以显示 placeholder
    if (childArr.length > 0) {
      curOptions = childArr;
      // 如果是路径中的最后一项且不是叶子节点，需要额外添加下一级的 placeholder
      if (i === path.length - 1) {
        items.value.push(childArr);
        steps.value.push(props.placeholder || '请选择');
      }
    }
  }

  // 设置 activeLevel：如果最后一项是非叶子节点，停留在它那一级（已选中）；否则停留在最后一级
  const lastOption = items.value[path.length - 1]?.[path[path.length - 1]];
  if (lastOption && !isLeafNode(lastOption)) {
    // 非叶子节点，activeLevel 设为该节点级别（选中态显示）
    activeLevel.value = path.length - 1;
  } else {
    // 叶子节点或已展开下一级，activeLevel 为最后一级
    activeLevel.value = items.value.length - 1;
  }
};

// Tab 点击：切换到对应级别（不重建 items，只改变活跃级别）
const onTabClick = (level: number) => {
  activeLevel.value = level;
};

// 选项点击
const onOptionClick = (option: CascaderOption, index: number, levelIndex?: number) => {
  if (isOptionDisabled(option)) return;

  // 使用传入的 levelIndex 或当前 activeLevel
  const currentLevel = levelIndex !== undefined ? levelIndex : activeLevel.value;

  // 触发 pick 事件
  emit('pick', getOptionValue(option), getOptionLabel(option), index, currentLevel);

  // 判断是否点击了已选中的同一选项
  const isSameSelection = selectedIndexes.value[currentLevel] === index;

  if (isSameSelection && !isLeafNode(option)) {
    // 点击已选中的非叶子节点 → 保留子级状态，只切换显示到下一级
    activeLevel.value = currentLevel + 1;
    return;
  }

  // 叶子节点（无论是否已选中）或 新选项 → 清空当前级别之后的选中索引，重新构建
  selectedIndexes.value = selectedIndexes.value.slice(0, currentLevel);
  selectedIndexes.value.push(index);

  // 更新 steps：保留当前级别之前的，添加当前选中项
  steps.value = steps.value.slice(0, currentLevel);
  steps.value.push(getOptionLabel(option));

  if (!isLeafNode(option)) {
    // 有子级，展开下一级
    // 清空当前级别之后的 items（保留当前级别）
    items.value = items.value.slice(0, currentLevel + 1);
    items.value.push(getOptionChildren(option)!);
    steps.value.push(props.placeholder || '请选择');
    activeLevel.value = items.value.length - 1;
  } else {
    // 叶子节点，先获取完整的 selectedOptions（包含叶子节点），再触发 change
    const selectedOptions = getSelectedOptions();
    const value = getOptionValue(option);
    emit('change', { value, selectedOptions });
    emit('update:value', value);
    // 触发 FormItem 验证（change 触发）
    formItemContext?.onValueChange(value);
    emit('close', { trigger: 'finish' });
    emit('update:show', false);
  }
};

// 确定按钮点击（仅 checkStrictly 模式）
const onConfirm = () => {
  const value = selectedValue.value;
  if (value !== undefined) {
    const selectedOptions = getSelectedOptions();
    emit('change', { value, selectedOptions });
    emit('update:value', value);
    // 触发 FormItem 验证（change 触发）
    formItemContext?.onValueChange(value);
    emit('close', { trigger: 'finish' });
  }
  emit('update:show', false);
};

// 弹层关闭（由 popup 的 close 事件触发，即关闭按钮触发）
const onPopupClose = () => {
  closeTriggeredByCloseBtn = true;
  emit('close', { trigger: 'close-btn' });
};

const onUpdateShow = (val: boolean) => {
  if (!val) {
    // 弹层关闭，判断触发来源
    if (closeTriggeredByCloseBtn) {
      closeTriggeredByCloseBtn = false;
      // 已经通过 onPopupClose 发过了，不再重复发
    } else {
      // 由 overlay 点击触发
      emit('close', { trigger: 'overlay' });
    }
  }
  emit('update:show', val);
};
</script>

<style scoped lang="scss">
.tsm-cascader {
  font-family: var(--tsm-font-family-regular);
  :deep(.tsm-popup-content-body) {
    padding: 0 !important;
  }
}

.tsm-cascader__container {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tsm-cascader__content-wrapper {
  display: flex;
  transition: transform ease 0.3s;
  overflow: hidden;
}

.tsm-cascader__content {
  width: 100vw;
  height: 300px;
}

.tsm-cascader__option {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: var(--tsm-spacing-m) var(--tsm-spacing-xl);
}

.tsm-cascader__option--disabled .tsm-cascader__option-label {
  color: var(--tsm-color-text-disabled);
}

.tsm-cascader__option-label {
  font-size: var(--tsm-font-size-text-l);
  line-height: var(--tsm-line-height-text-l);
  color: var(--tsm-color-text-primary);
  font-weight: var(--tsm-font-weight-regular);
}

.tsm-cascader__option-icon {
  color: var(--tsm-color-primary);
  --icon-size: 16px !important;
}

.tsm-cascader__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: var(--tsm-color-text-secondary);
  font-size: var(--tsm-font-size-text-l);
}

.tsm-cascader__footer {
  width: 100%;
}
</style>
