/** * SelectPopup 弹出选择面板 * @description tsm-select 内部子组件，底部弹出面板：搜索 + 选项列表 + 空状态 + Footer */
<template>
  <tsm-popup
    :show="show"
    mode="bottom"
    :title="title"
    :closeable="true"
    :closeOnClickOverlay="true"
    :round="20"
    :zIndex="10075"
    :customClass="filterable ? 'tsm-select-popup tsm-select-popup--search' : 'tsm-select-popup '"
    @update:show="handleClose"
  >
    <view class="tsm-select-popup__inner">
      <!-- 搜索区域 -->
      <view v-if="filterable" class="tsm-select-popup__search">
        <tsm-search
          v-model="searchKeyword"
          :placeholder="searchPlaceholder"
          :clearable="true"
          size="default"
          shape="rectangle"
          bgColor="default"
          @search="handleSearch"
          @clear="handleSearchClear"
        />
      </view>

      <!-- 选项列表 -->
      <scroll-view
        class="tsm-select-popup__body"
        :scroll-y="true"
        v-if="filteredOptions.length > 0 || loading"
        @scrolltolower="handleScrollToLower"
      >
        <option-item
          v-for="opt in filteredOptions"
          :key="opt.value"
          :option="opt"
          :selected="isOptionSelected(opt)"
          :disabled="isOptionDisabledByLimit(opt)"
          :query="filterable ? searchKeyword : ''"
          :hasSubText="hasSubText"
          @click="handleOptionClick"
        />

        <!-- 分页：加载中 / 加载完毕 -->
        <view v-if="pagination && filteredOptions.length > 0" class="tsm-select-popup__pagination">
          <view v-if="paginationLoading" class="tsm-select-popup__pagination-loading">
            <tsm-loading />
          </view>
          <view v-else-if="finished" class="tsm-select-popup__pagination-finished">
            <text class="tsm-select-popup__pagination-text">{{ finishedText }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 空状态 -->
      <view v-if="!loading && filteredOptions.length === 0" class="tsm-select-popup__empty">
        <tsm-empty
          v-if="(filterable || remote) && searchKeyword.length > 0"
          type="noSearch"
          title="搜索结果为空"
          description="换个关键词试试吧"
        />
        <tsm-empty v-else type="noData" title="暂无数据" />
      </view>

      <!-- 加载中 -->
      <view v-if="loading" class="tsm-select-popup__loading">
        <tsm-loading />
      </view>

      <!-- Footer -->
      <view v-if="showFooter && filteredOptions.length > 0" class="tsm-select-popup__footer">
        <view class="tsm-select-popup__footer-btn">
          <tsm-button type="solid" theme="primary" long @tap="handleConfirm">
            {{ confirmText }}
          </tsm-button>
        </view>
      </view>
    </view>
  </tsm-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { SelectOption } from './props';
import OptionItem from './option.vue';

interface SelectPopupProps {
  show: boolean;
  title: string;
  options: SelectOption[];
  modelValue: string | number | (string | number)[];
  multiple: boolean;
  multipleLimit: number;
  filterable: boolean;
  searchPlaceholder: string;
  remote: boolean;
  loading: boolean;
  showFooter: boolean;
  confirmText: string;
  /** 自定义过滤方法 */
  filterMethod?: (value: string, option: SelectOption) => boolean;
  /** 是否启用分页模式 */
  pagination: boolean;
  /** 分页加载中 */
  paginationLoading: boolean;
  /** 全部数据加载完毕 */
  finished: boolean;
  /** 加载完毕提示文案 */
  finishedText: string;
  /** 是否启用副标题双行布局 */
  hasSubText: boolean;
}

const props = withDefaults(defineProps<SelectPopupProps>(), {
  show: false,
  title: '',
  options: () => [],
  modelValue: '',
  multiple: false,
  multipleLimit: 0,
  filterable: false,
  searchPlaceholder: '请输入关键词搜索',
  remote: false,
  loading: false,
  showFooter: false,
  confirmText: '确定',
  pagination: false,
  paginationLoading: false,
  finished: false,
  finishedText: '没有更多了',
  hasSubText: false,
});

const emit = defineEmits<{
  'update:show': [show: boolean];
  select: [value: string | number];
  remove: [value: string | number];
  confirm: [];
  search: [keyword: string];
  'load-more': [];
}>();

// ==================== 状态 ====================

const searchKeyword = ref('');

// remote/分页 模式下每次打开 popup 重置搜索状态
watch(
  () => props.show,
  (show: boolean): void => {
    if (!show) return;
    const shouldReset = props.remote || (props.pagination && searchKeyword.value.length > 0);
    if (shouldReset) {
      searchKeyword.value = '';
      emit('search', '');
    }
  }
);

// ==================== 计算属性 ====================

/** 已选值列表 */
const selectedValues = computed((): (string | number)[] => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) ? props.modelValue : [];
  }
  return props.modelValue !== '' && props.modelValue !== undefined && props.modelValue !== null
    ? [props.modelValue]
    : [];
});

/**
 * 过滤后的选项列表
 *
 * 场景路由：
 * 1. 静态 options（无 remote 无 keyword）→ 返回全量 props.options
 * 2. remote 模式 → 父组件控制数据，直接透传 props.options
 * 3. filterable 本地过滤 → filterMethod ?? 大小写不敏感 label 匹配
 */
const filteredOptions = computed((): SelectOption[] => {
  const keyword = searchKeyword.value.trim();

  // 场景 1 & 2：无关键词 或 远程搜索 → 透传
  if (!keyword || props.remote) return props.options;
  // 场景 3：本地过滤
  if (props.filterMethod) {
    return props.options.filter(opt => props.filterMethod!(keyword, opt));
  }
  return props.options.filter(opt => opt.label.toLowerCase().includes(keyword.toLowerCase()));
});

/** 判断选项是否选中 */
const isOptionSelected = (option: SelectOption): boolean => {
  return selectedValues.value.includes(option.value);
};

/** 判断选项是否因 multipleLimit 限制而不可选 */
const isOptionDisabledByLimit = (option: SelectOption): boolean => {
  if (!props.multiple || props.multipleLimit <= 0) return false;
  if (isOptionSelected(option)) return false;
  return selectedValues.value.length >= props.multipleLimit;
};

// ==================== 方法 ====================

const handleClose = (show: boolean): void => {
  if (!show) {
    emit('update:show', false);
  }
};

const handleOptionClick = (option: SelectOption): void => {
  if (option.disabled || isOptionDisabledByLimit(option)) return;

  if (props.multiple) {
    // 多选：切换选中
    if (isOptionSelected(option)) {
      emit('remove', option.value);
    } else {
      emit('select', option.value);
    }
  } else {
    // 单选：选中后关闭
    emit('select', option.value);
    emit('update:show', false);
    searchKeyword.value = '';
  }
};

const handleConfirm = (): void => {
  emit('confirm');
  emit('update:show', false);
  searchKeyword.value = '';
};

const handleSearch = (keyword: string): void => {
  if (props.remote) {
    emit('search', keyword.trim());
  }
};

const handleSearchClear = (): void => {
  searchKeyword.value = '';
  if (props.remote) {
    emit('search', '');
  }
};

/** 滚动触底加载更多 */
const handleScrollToLower = (): void => {
  if (!props.pagination || props.paginationLoading || props.finished) return;
  emit('load-more');
};
</script>

<style scoped lang="scss">
// ==================== popup 高度适配 ====================
.tsm-select-popup {
  :deep(.tsm-transition) {
    height: calc(100% - 44px) !important;
  }
}

// ==================== 内部 flex 布局：搜索/Footer 固定，选项滚动 ====================
.tsm-select-popup__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tsm-select-popup__search {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: var(--tsm-spacing-s) 0;
  :deep(.tsm-search) {
    width: 100%;
  }
}

// ==================== 选项列表 ====================
.tsm-select-popup__body {
  flex: 1 0 0;
  min-height: 0;
}

// ==================== 空状态 ====================
.tsm-select-popup__empty {
  flex: 1 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 0;
}

// ==================== 加载中 ====================

.tsm-select-popup__loading {
  flex: 1 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

// ==================== 分页底部 ====================

.tsm-select-popup__pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--tsm-spacing-xl) 0;
}

.tsm-select-popup__pagination-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tsm-select-popup__pagination-finished {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tsm-select-popup__pagination-text {
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-m);
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-m);
  color: var(--tsm-color-text-quaternary);
}

// ==================== Footer ====================

.tsm-select-popup__footer {
  flex-shrink: 0;
  display: flex;
  gap: var(--tsm-spacing-xl);
  align-items: flex-start;
  padding: var(--tsm-spacing-2xl) 0 var(--tsm-spacing-4xl);
  background-color: var(--tsm-color-bg-white);
}

.tsm-select-popup__footer-btn {
  display: flex;
  flex: 1 0 0;
  gap: var(--tsm-spacing-xl);
  align-items: center;
  min-width: 0;
}
</style>
