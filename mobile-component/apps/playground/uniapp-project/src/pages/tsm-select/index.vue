<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Select 下拉选择器</text>
      </view>

      <!-- 基础单选 -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">基础用法（单选）</text>
          <tsm-select
            v-model="basicValue"
            :options="fruitOptions"
            filterable
            placeholder="请选择水果"
            title="选择水果"
            @change="onBasicChange"
          />
          <text class="event-log">选中值：{{ basicValue || '未选择' }}</text>
        </view>
      </view>

      <!-- 多选 + collapse-tags -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">多选 + 标签折叠</text>
          <tsm-select
            v-model="multiValue"
            :options="fruitOptions"
            multiple
            :collapse-tags="true"
            :max-collapse-tags="2"
            clearable
            placeholder="请选择多个水果"
            title="选择水果（多选）"
            @change="onMultiChange"
          />
          <text class="event-log">选中值：{{ multiValue.length ? multiValue.join(', ') : '未选择' }}</text>
        </view>
      </view>

      <!-- 多选不限制标签 -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">多选（不限制标签数量）</text>
          <tsm-select
            v-model="unlimitedMultiValue"
            :options="fruitOptions"
            multiple
            placeholder="请选择多个水果"
            title="选择水果（多选）"
            @change="onUnlimitedMultiChange"
          />
          <text class="event-log"
            >选中值：{{ unlimitedMultiValue.length ? unlimitedMultiValue.join(', ') : '未选择' }}</text
          >
        </view>
      </view>

      <!-- 多选 + multipleLimit + Footer -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">多选限制（最多选 3 项）</text>
          <tsm-select
            v-model="limitedValue"
            :options="fruitOptions"
            multiple
            :multiple-limit="3"
            placeholder="最多选3个"
            title="选择（限3项）"
            @change="onLimitedChange"
          />
          <text class="event-log">选中值：{{ limitedValue.length ? limitedValue.join(', ') : '未选择' }}</text>
        </view>
      </view>

      <!-- filterable 搜索过滤 -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">可搜索过滤</text>
          <tsm-select
            v-model="filterableValue"
            :options="cityOptions"
            filterable
            placeholder="输入关键字搜索"
            title="搜索城市"
            @change="onFilterableChange"
          />
          <text class="event-log">选中值：{{ filterableValue || '未选择' }}</text>
        </view>
      </view>

      <!-- 模拟远程搜索 -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">模拟远程搜索</text>
          <tsm-select
            v-model="remoteValue"
            :options="remoteOptions"
            remote
            :loading="remoteLoading"
            :remote-method="onRemoteSearch"
            filterable
            placeholder="输入关键字远程搜索"
            title="远程搜索"
            @change="onRemoteChange"
          />
          <text class="event-log">选中值：{{ remoteValue || '未选择' }}</text>
          <text v-if="remoteLoading" class="event-log">远程加载中...</text>
        </view>
      </view>

      <!-- 模拟远程搜索（多选） -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">模拟远程搜索（多选）</text>
          <tsm-select
            v-model="remoteMultiValue"
            :options="remoteMultiOptions"
            multiple
            remote
            :loading="remoteMultiLoading"
            :remote-method="onRemoteMultiSearch"
            filterable
            placeholder="输入关键字远程搜索"
            title="远程搜索（多选）"
            @change="onRemoteMultiChange"
          />
          <text class="event-log">选中值：{{ remoteMultiValue.length ? remoteMultiValue.join(', ') : '未选择' }}</text>
          <text v-if="remoteMultiLoading" class="event-log">远程加载中...</text>
        </view>
      </view>

      <!-- 分页模式（单选） -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">分页模式（单选）</text>
          <tsm-select
            v-model="paginationValue"
            :options="paginationOptions"
            :pagination="true"
            :pagination-loading="paginationLoading"
            :finished="paginationFinished"
            :finished-text="paginationFinishedText"
            filterable
            placeholder="滚动加载更多"
            title="分页选择（单选）"
            @load-more="onPaginationLoadMore"
            @change="onPaginationChange"
          />
          <text class="event-log">
            选中值：{{ paginationValue || '未选择' }} | 已加载 {{ paginationOptions.length }} / {{ paginationTotal }} 条
          </text>
        </view>
      </view>

      <!-- 分页模式（多选） -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">分页模式（多选）</text>
          <tsm-select
            v-model="paginationMultiValue"
            :options="paginationMultiOptions"
            multiple
            :pagination="true"
            :pagination-loading="paginationMultiLoading"
            :finished="paginationMultiFinished"
            :finished-text="paginationMultiFinishedText"
            filterable
            placeholder="滚动加载更多"
            title="分页选择（多选）"
            @load-more="onPaginationMultiLoadMore"
            @change="onPaginationMultiChange"
          />
          <text class="event-log">
            选中值：{{ paginationMultiValue.length ? paginationMultiValue.join(', ') : '未选择' }}
          </text>
          <text class="event-log"> 已加载 {{ paginationMultiOptions.length }} / {{ paginationMultiTotal }} 条 </text>
        </view>
      </view>

      <!-- 分页模式 + 远程搜索 -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">分页模式 + 远程搜索</text>
          <tsm-select
            v-model="paginationSearchValue"
            :options="paginationSearchOptions"
            :pagination="true"
            :pagination-loading="paginationSearchLoading"
            :finished="paginationSearchFinished"
            :finished-text="paginationSearchFinishedText"
            remote
            :remote-method="onPaginationSearch"
            filterable
            placeholder="输入关键词搜索 + 滚动分页"
            title="搜索 + 分页"
            @load-more="onPaginationSearchLoadMore"
            @change="onPaginationSearchChange"
          />
          <text class="event-log">
            选中值：{{ paginationSearchValue || '未选择' }} | 当前页：{{ paginationSearchPage }}
          </text>
        </view>
      </view>

      <!-- 分页 + 初始数据 + 搜索 -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">分页 + 初始数据 + 搜索</text>
          <tsm-select
            v-model="paginationInitValue"
            multiple
            :options="paginationInitOptions"
            :pagination="true"
            :pagination-loading="paginationInitLoading"
            :finished="paginationInitFinished"
            :finished-text="paginationInitFinishedText"
            remote
            :remote-method="onPaginationInitSearch"
            filterable
            placeholder="已加载第1页，输入关键词搜索"
            title="分页 + 初始数据"
            @load-more="onPaginationInitLoadMore"
            @change="onPaginationInitChange"
          />
          <text class="event-log">
            选中值：{{ paginationInitValue || '未选择' }} | 已加载 {{ paginationInitOptions.length }} /
            {{ paginationInitTotal }} 条
          </text>
        </view>
      </view>

      <!-- clearable 清除 -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">可清除</text>
          <tsm-select
            v-model="clearableValue"
            :options="fruitOptions"
            clearable
            placeholder="可清除选择"
            title="选择（可清除）"
            @change="onClearableChange"
            @clear="onClear"
          />
          <text class="event-log">选中值：{{ clearableValue || '未选择' }}</text>
        </view>
      </view>

      <!-- 禁用状态 -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">禁用状态</text>
          <tsm-select v-model="disabledValue" :options="fruitOptions" disabled placeholder="禁用状态" title="选择" />
          <text class="event-log">禁用状态，不可交互</text>
        </view>
      </view>

      <!-- 只读状态 -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">只读状态</text>
          <tsm-select
            v-model="readonlyValue"
            :options="fruitOptions"
            multiple
            readonly
            placeholder="只读状态"
            title="选择"
          />
        </view>
      </view>

      <!-- size 切换 -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">尺寸切换</text>
          <tsm-select
            v-model="sizeDefaultValue"
            :options="fruitOptions"
            size="default"
            placeholder="default (40px)"
            title="选择"
          />
          <tsm-select
            v-model="sizeSmallValue"
            :options="fruitOptions"
            size="small"
            placeholder="small (32px)"
            title="选择"
          />
        </view>
      </view>

      <!-- 禁用选项 -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">含禁用选项</text>
          <tsm-select
            v-model="disabledOptionValue"
            :options="optionsWithDisabled"
            placeholder="含禁用选项"
            title="选择"
            @change="onDisabledOptionChange"
          />
          <text class="event-log">选中值：{{ disabledOptionValue || '未选择' }}</text>
        </view>
      </view>

      <!-- 副标题模式（单选） -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">副标题模式（单选）</text>
          <tsm-select
            v-model="descriptionValue"
            :options="descriptionOptions"
            :has-sub-text="true"
            filterable
            placeholder="请选择人员"
            title="选择人员"
            @change="onDescriptionChange"
          />
          <text class="event-log">选中值：{{ descriptionValue || '未选择' }}</text>
        </view>
      </view>

      <!-- 副标题模式（多选） -->
      <view class="demo-card">
        <view class="demo-content">
          <text class="section-title">副标题模式（多选）</text>
          <tsm-select
            v-model="descriptionMultiValue"
            :options="descriptionOptions"
            multiple
            :has-sub-text="true"
            filterable
            placeholder="请选择人员"
            title="选择人员（多选）"
            @change="onDescriptionMultiChange"
          />
          <text class="event-log"
            >选中值：{{ descriptionMultiValue.length ? descriptionMultiValue.join(', ') : '未选择' }}</text
          >
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// ==================== 基础单选 ====================
const basicValue = ref<string | number>('');
const onBasicChange = (val: string | number) => {
  basicValue.value = val;
};

// ==================== 多选 ====================
const multiValue = ref<(string | number)[]>([]);
const onMultiChange = (val: (string | number)[]) => {
  multiValue.value = Array.isArray(val) ? val : [];
};

// ==================== 多选不限制标签 ====================
const unlimitedMultiValue = ref<(string | number)[]>([]);
const onUnlimitedMultiChange = (val: (string | number)[]) => {
  unlimitedMultiValue.value = Array.isArray(val) ? val : [];
};

// ==================== 多选限制 ====================
const limitedValue = ref<(string | number)[]>([]);
const onLimitedChange = (val: (string | number)[]) => {
  limitedValue.value = Array.isArray(val) ? val : [];
};

// ==================== 搜索过滤 ====================
const filterableValue = ref<string | number>('');
const onFilterableChange = (val: string | number) => {
  filterableValue.value = val;
};

// ==================== 清除 ====================
const clearableValue = ref<string | number>('');
const onClearableChange = (val: string | number) => {
  clearableValue.value = val;
};
const onClear = () => {
  console.log('清除了');
};

// ==================== 禁用 ====================
const disabledValue = ref<string | number>('apple');

// ==================== 只读 ====================
const readonlyValue = ref<(string | number)[]>([
  'apple',
  'banana',
  'orange',
  'grape',
  'watermelon',
  'strawberry',
  'mango',
  'blueberry',
  'cantaloupe',
  'dragonfruit',
  'kiwi',
  'jackfruit',
  'passionfruit',
  'rambutan',
  'mangosteen',
  'passionfruit',
  'rambutan',
  'mangosteen',
  'passionfruit',
  'rambutan',
  'rambutan',
  'mangosteen',
  'passionfruit',
  'rambutan',
  'mangosteen',
  'mangosteen',
]);

// ==================== size ====================
const sizeDefaultValue = ref<string | number>('');
const sizeSmallValue = ref<string | number>('');

// ==================== 禁用选项 ====================
const disabledOptionValue = ref<string | number>('');
const onDisabledOptionChange = (val: string | number) => {
  disabledOptionValue.value = val;
};

// ==================== 副标题模式 ====================
const descriptionValue = ref<string | number>('');
const descriptionMultiValue = ref<(string | number)[]>([]);

const descriptionOptions = [
  { label: '张三', value: 'zhangsan', subText: '技术部 · 高级工程师' },
  { label: '李四', value: 'lisi', subText: '产品部 · 产品经理' },
  { label: '王五', value: 'wangwu', subText: '设计部 · UI 设计师' },
  { label: '赵六', value: 'zhaoliu' },
  { label: '陈七', value: 'chenqi', subText: '运营部 · 运营总监' },
];

const onDescriptionChange = (val: string | number) => {
  descriptionValue.value = val;
};

const onDescriptionMultiChange = (val: (string | number)[]) => {
  descriptionMultiValue.value = Array.isArray(val) ? val : [];
};

// ==================== 远程搜索 ====================
const remoteValue = ref<string | number>('');
const remoteLoading = ref(false);
const remoteOptions = ref<{ label: string; value: string }[]>([]);

const allRemoteData = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' },
  { label: '杭州', value: 'hangzhou' },
  { label: '南京', value: 'nanjing' },
  { label: '成都', value: 'chengdu' },
  { label: '武汉', value: 'wuhan' },
  { label: '西安', value: 'xian' },
  { label: '重庆', value: 'chongqing' },
  { label: '长沙', value: 'changsha' },
  { label: '郑州', value: 'zhengzhou' },
  { label: '合肥', value: 'hefei' },
  { label: '济南', value: 'jinan' },
  { label: '昆明', value: 'kunming' },
  { label: '厦门', value: 'xiamen' },
  { label: '青岛', value: 'qingdao' },
  { label: '苏州', value: 'suzhou' },
  { label: '天津', value: 'tianjin' },
  { label: '福州', value: 'fuzhou' },
];

let remoteTimer: ReturnType<typeof setTimeout> | null = null;

const onRemoteSearch = (keyword: string) => {
  if (remoteTimer) {
    clearTimeout(remoteTimer);
  }
  if (!keyword) {
    remoteOptions.value = [];
    remoteLoading.value = false;
    return;
  }
  remoteLoading.value = true;
  remoteTimer = setTimeout(() => {
    remoteOptions.value = allRemoteData.filter(item => item.label.includes(keyword));
    remoteLoading.value = false;
  }, 300);
};

const onRemoteChange = (val: string | number) => {
  remoteValue.value = val;
};

// ==================== 远程搜索（多选）====================
const remoteMultiValue = ref<(string | number)[]>([]);
const remoteMultiLoading = ref(false);
const remoteMultiOptions = ref<{ label: string; value: string }[]>([]);

let remoteMultiTimer: ReturnType<typeof setTimeout> | null = null;

const onRemoteMultiSearch = (keyword: string) => {
  if (remoteMultiTimer) {
    clearTimeout(remoteMultiTimer);
  }
  if (!keyword) {
    remoteMultiOptions.value = [];
    remoteMultiLoading.value = false;
    return;
  }
  remoteMultiLoading.value = true;
  remoteMultiTimer = setTimeout(() => {
    remoteMultiOptions.value = allRemoteData.filter(item => item.label.includes(keyword));
    remoteMultiLoading.value = false;
  }, 300);
};

const onRemoteMultiChange = (val: (string | number)[]) => {
  remoteMultiValue.value = Array.isArray(val) ? val : [];
};

// ==================== 分页模式（单选）====================
const paginationValue = ref<string | number>('');
const paginationOptions = ref<{ label: string; value: string }[]>([]);
const paginationLoading = ref(false);
const paginationFinished = ref(false);
const paginationFinishedText = ref('没有更多了');
const paginationTotal = ref(50);
const paginationPageSize = 15;
let paginationPage = 1;

// 生成模拟数据
const generatePageData = (page: number, pageSize: number, total: number) => {
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const items: { label: string; value: string }[] = [];
  for (let i = start; i < end; i++) {
    items.push({ label: `选项${i + 1}`, value: `option_${i + 1}` });
  }
  return items;
};

const onPaginationLoadMore = () => {
  paginationLoading.value = true;
  setTimeout(() => {
    paginationPage++;
    const newItems = generatePageData(paginationPage, paginationPageSize, paginationTotal.value);
    paginationOptions.value = [...paginationOptions.value, ...newItems];
    paginationLoading.value = false;
    if (paginationPage * paginationPageSize >= paginationTotal.value) {
      paginationFinished.value = true;
      paginationFinishedText.value = `全部加载完毕（共 ${paginationTotal.value} 条）`;
    }
  }, 500);
};

const onPaginationChange = (val: string | number) => {
  paginationValue.value = val;
};

// 初始加载第一页
setTimeout(() => {
  paginationOptions.value = generatePageData(1, paginationPageSize, paginationTotal.value);
}, 100);

// ==================== 分页模式（多选）====================
const paginationMultiValue = ref<(string | number)[]>([]);
const paginationMultiOptions = ref<{ label: string; value: string }[]>([]);
const paginationMultiLoading = ref(false);
const paginationMultiFinished = ref(false);
const paginationMultiFinishedText = ref('没有更多了');
const paginationMultiTotal = ref(50);
const paginationMultiPageSize = 15;
let paginationMultiPage = 1;

const onPaginationMultiLoadMore = () => {
  paginationMultiLoading.value = true;
  setTimeout(() => {
    paginationMultiPage++;
    const newItems = generatePageData(paginationMultiPage, paginationMultiPageSize, paginationMultiTotal.value);
    paginationMultiOptions.value = [...paginationMultiOptions.value, ...newItems];
    paginationMultiLoading.value = false;
    if (paginationMultiPage * paginationMultiPageSize >= paginationMultiTotal.value) {
      paginationMultiFinished.value = true;
      paginationMultiFinishedText.value = `全部加载完毕（共 ${paginationMultiTotal.value} 条）`;
    }
  }, 500);
};

const onPaginationMultiChange = (val: (string | number)[]) => {
  paginationMultiValue.value = Array.isArray(val) ? val : [];
};

setTimeout(() => {
  paginationMultiOptions.value = generatePageData(1, paginationMultiPageSize, paginationMultiTotal.value);
}, 100);

// ==================== 分页模式 + 远程搜索 ====================
const paginationSearchValue = ref<string | number>('');
const paginationSearchOptions = ref<{ label: string; value: string }[]>([]);
const paginationSearchLoading = ref(false);
const paginationSearchFinished = ref(false);
const paginationSearchFinishedText = ref('没有更多了');
const paginationSearchPage = ref(1);
const paginationSearchPageSize = 15;
let paginationSearchKeyword = '';

// 模拟远程数据源
const allPaginationSearchData = Array.from({ length: 100 }, (_, i) => ({
  label: `搜索结果项${i + 1}`,
  value: `search_${i + 1}`,
}));

const onPaginationSearch = (keyword: string) => {
  paginationSearchKeyword = keyword;
  paginationSearchPage.value = 1;
  paginationSearchFinished.value = false;
  if (!keyword) {
    paginationSearchOptions.value = [];
    return;
  }
  // 模拟远程搜索（过滤 + 分页第一页）
  const filtered = allPaginationSearchData.filter(item => item.label.includes(keyword));
  paginationSearchOptions.value = filtered.slice(0, paginationSearchPageSize);
  if (paginationSearchPageSize >= filtered.length) {
    paginationSearchFinished.value = true;
    paginationSearchFinishedText.value =
      filtered.length > 0 ? `全部加载完毕（共 ${filtered.length} 条）` : '没有更多了';
  }
};

const onPaginationSearchLoadMore = () => {
  paginationSearchLoading.value = true;
  setTimeout(() => {
    const filtered = allPaginationSearchData.filter(item => item.label.includes(paginationSearchKeyword));
    paginationSearchPage.value++;
    const start = (paginationSearchPage.value - 1) * paginationSearchPageSize;
    const newItems = filtered.slice(start, start + paginationSearchPageSize);
    paginationSearchOptions.value = [...paginationSearchOptions.value, ...newItems];
    paginationSearchLoading.value = false;
    if (start + paginationSearchPageSize >= filtered.length) {
      paginationSearchFinished.value = true;
      paginationSearchFinishedText.value = `全部加载完毕（共 ${filtered.length} 条）`;
    }
  }, 500);
};

const onPaginationSearchChange = (val: string | number) => {
  paginationSearchValue.value = val;
};

// ==================== 分页 + 初始数据 + 搜索 ====================
const paginationInitValue = ref<string | number>('');
const paginationInitOptions = ref<{ label: string; value: string }[]>([]);
const paginationInitLoading = ref(false);
const paginationInitFinished = ref(false);
const paginationInitFinishedText = ref('没有更多了');
const paginationInitTotal = ref(80);
const paginationInitPageSize = 15;
let paginationInitPage = 1;
let paginationInitKeyword = '';

// 模拟全量数据源
const allPaginationInitData = Array.from({ length: paginationInitTotal.value }, (_, i) => ({
  label: `选项${i + 1}`,
  value: `init_${i + 1}`,
}));

// 初始加载第一页（无关键词）
paginationInitOptions.value = allPaginationInitData.slice(0, paginationInitPageSize);

// 搜索：重置列表，走远程搜索逻辑
const onPaginationInitSearch = (keyword: string) => {
  paginationInitKeyword = keyword;
  paginationInitPage = 1;
  paginationInitFinished.value = false;

  if (!keyword) {
    // 清空关键词 → 恢复初始无关键词数据
    paginationInitOptions.value = allPaginationInitData.slice(0, paginationInitPageSize);
    if (paginationInitPageSize >= paginationInitTotal.value) {
      paginationInitFinished.value = true;
    }
    return;
  }

  // 模拟远程搜索
  const filtered = allPaginationInitData.filter(item => item.label.includes(keyword));
  paginationInitOptions.value = filtered.slice(0, paginationInitPageSize);
  if (paginationInitPageSize >= filtered.length) {
    paginationInitFinished.value = true;
    paginationInitFinishedText.value = filtered.length > 0 ? `全部加载完毕（共 ${filtered.length} 条）` : '没有更多了';
  }
};

// 滚动触底：在当前数据集上追加下一页
const onPaginationInitLoadMore = () => {
  paginationInitLoading.value = true;
  setTimeout(() => {
    paginationInitPage++;
    const source = paginationInitKeyword
      ? allPaginationInitData.filter(item => item.label.includes(paginationInitKeyword))
      : allPaginationInitData;
    const start = (paginationInitPage - 1) * paginationInitPageSize;
    const newItems = source.slice(start, start + paginationInitPageSize);
    paginationInitOptions.value = [...paginationInitOptions.value, ...newItems];
    paginationInitLoading.value = false;
    if (start + paginationInitPageSize >= source.length) {
      paginationInitFinished.value = true;
      paginationInitFinishedText.value = `全部加载完毕（共 ${source.length} 条）`;
    }
  }, 500);
};

const onPaginationInitChange = (val: string | number) => {
  paginationInitValue.value = val;
};

// ==================== 选项数据 ====================

const fruitOptions = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
  { label: '葡萄', value: 'grape' },
  { label: '西瓜', value: 'watermelon' },
  { label: '草莓', value: 'strawberry' },
  { label: '芒果', value: 'mango' },
  { label: '蓝莓', value: 'blueberry' },
  { label: '哈密瓜', value: 'cantaloupe' },
  { label: '火龙果', value: 'dragonfruit' },
  { label: '奇异果', value: 'kiwi' },
  { label: '菠萝蜜', value: 'jackfruit' },
  { label: '百香果', value: 'passionfruit' },
  { label: '红毛丹', value: 'rambutan' },
  { label: '山竹果', value: 'mangosteen' },
  { label: '无花果', value: 'fig' },
  { label: '猕猴桃', value: 'kiwifruit' },
  { label: '车厘子', value: 'cherry' },
  { label: '石榴', value: 'pomegranate' },
  { label: '杨梅', value: 'bayberry' },
  { label: '荔枝', value: 'lychee' },
  { label: '桂圆', value: 'longan' },
  { label: '蛇皮果', value: 'salak' },
  { label: '榴莲', value: 'durian' },
  { label: '椰子', value: 'coconut' },
];

const cityOptions = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' },
  { label: '杭州', value: 'hangzhou' },
  { label: '南京', value: 'nanjing' },
  { label: '成都', value: 'chengdu' },
  { label: '武汉', value: 'wuhan' },
  { label: '西安', value: 'xian' },
  { label: '重庆', value: 'chongqing' },
];

const optionsWithDisabled = [
  { label: '可用选项', value: 'enabled1' },
  { label: '禁用选项', value: 'disabled1', disabled: true },
  { label: '可用选项', value: 'enabled2' },
  { label: '禁用选项', value: 'disabled2', disabled: true },
];
</script>

<style scoped lang="scss">
@import '@/uni_modules/@zpackage/mobile-package/ui/libs/scss/platform-style.scss';

.container {
  padding: 12px;
  background: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  padding: 10px 10px 4px;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
  display: block;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px 12px 12px;
  margin-bottom: 10px;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  display: block;
}

.event-log {
  font-size: 14px;
  color: #6b7280;
  display: block;
}
</style>
