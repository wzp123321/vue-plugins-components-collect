<!--
  报表展示（数据中台 · 展示层）
  ============================================================================
  纵向画廊：六类报表单元依次排列，每个单元由 LazySection 包裹，
  未滚动到视口时只渲染骨架屏，命中视口后才挂载真实内容（含 echarts 初始化）。
  顶部统计「已渲染 n/6」用于验证懒加载确实生效；「重置」会重建全部单元。
-->
<template>
  <div class="rs-page">
    <header class="rs-head">
      <div class="rs-head__text">
        <h5 class="rs-title">报表展示</h5>
        <p class="rs-desc">
          参考帆软报表形态整理的六类展示单元：交叉表、分组表、明细表、复杂表头、指标卡组、图文联动。
          全部单元走「滚动到视口才渲染」——首屏只初始化第一块，其余在滚动过程中逐个挂载。
        </p>
      </div>

      <div class="rs-head__stat">
        <div class="rs-count">
          <span class="rs-count__num">{{ renderedCount }}</span>
          <span class="rs-count__total">/ {{ sections.length }}</span>
          <span class="rs-count__label">已渲染</span>
        </div>
        <el-button size="small" @click="reload">重置</el-button>
      </div>
    </header>

    <LazySection
      v-for="item in sections"
      :key="`${item.id}-${reloadKey}`"
      :index="item.index"
      :title="item.title"
      :desc="item.desc"
      :tag="item.tag"
      :min-height="item.minHeight"
      @rendered="onRendered"
    >
      <component :is="item.component" />
    </LazySection>

    <footer class="rs-foot">
      数据为本地 mock，口径与「指标口径管理」示例一致（园区 × 台区 × 用电类型 × 月份 → 售电量）
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import LazySection from './components/LazySection.vue';
import CrossTableReport from './components/CrossTableReport.vue';
import GroupTableReport from './components/GroupTableReport.vue';
import DetailTableReport from './components/DetailTableReport.vue';
import ComplexHeaderReport from './components/ComplexHeaderReport.vue';
import KpiCardReport from './components/KpiCardReport.vue';
import ChartTableReport from './components/ChartTableReport.vue';

defineOptions({ name: 'ReportShowcase' });

const sections = [
  {
    id: 'cross',
    index: 1,
    title: '交叉表',
    desc: '行 = 园区，列 = 月份，自动行列合计与总计；单元格按数值叠加色阶条件格式。',
    tag: '条件格式',
    minHeight: 340,
    component: CrossTableReport,
  },
  {
    id: 'group',
    index: 2,
    title: '分组表',
    desc: '按园区分组，组头给园区小计与占全量比，组内展开台区明细并标环比。',
    tag: '分组小计',
    minHeight: 460,
    component: GroupTableReport,
  },
  {
    id: 'detail',
    index: 3,
    title: '明细表',
    desc: '全量明细按列排序后分页，表头随滚动固定，末行自动合计当前页。',
    tag: '分页 / 排序',
    minHeight: 400,
    component: DetailTableReport,
  },
  {
    id: 'complex',
    index: 4,
    title: '复杂表头',
    desc: '季度 → 月份 → 指标 三级表头合并，对齐中国式复杂报表的典型表样。',
    tag: '多级表头',
    minHeight: 320,
    component: ComplexHeaderReport,
  },
  {
    id: 'kpi',
    index: 5,
    title: '指标卡组',
    desc: '驾驶舱顶部形态：主数值 + 同比环比胶囊 + 纯 SVG 迷你走势线。',
    tag: 'KPI',
    minHeight: 200,
    component: KpiCardReport,
  },
  {
    id: 'chart',
    index: 6,
    title: '图文联动',
    desc: '柱线混合双轴图 + 台区明细；点击柱子切换园区，明细表跟随刷新。',
    tag: '图表联动',
    minHeight: 460,
    component: ChartTableReport,
  },
];

const renderedCount = ref(0);
const renderedIndexes = ref<number[]>([]);
const reloadKey = ref(0);

const onRendered = (index: number) => {
  if (renderedIndexes.value.includes(index)) return;
  renderedIndexes.value = [...renderedIndexes.value, index];
  renderedCount.value = renderedIndexes.value.length;
};

/** 重建全部单元：key 变化会让 LazySection 重新走一遍骨架 → 渲染 */
const reload = () => {
  reloadKey.value += 1;
  renderedIndexes.value = [];
  renderedCount.value = 0;
};
</script>

<style lang="less" scoped>
.rs-page {
  padding: 20px;
}

.rs-head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 16px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--ai-hairline);

  &__text {
    min-width: 0;
  }

  &__stat {
    display: flex;
    flex: 0 0 auto;
    gap: 12px;
    align-items: center;
  }
}

.rs-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ai-text);
}

.rs-desc {
  max-width: 760px;
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ai-text-mute);
}

.rs-count {
  display: flex;
  gap: 4px;
  align-items: baseline;
  padding: 4px 12px;
  border: 1px solid var(--ai-hairline);
  border-radius: 999px;

  &__num {
    font-family: var(--ai-font-mono);
    font-size: 15px;
    font-weight: 600;
    color: var(--ai-accent);
  }

  &__total {
    font-family: var(--ai-font-mono);
    font-size: 12px;
    color: var(--ai-text-mute);
  }

  &__label {
    margin-left: 6px;
    font-size: 12px;
    color: var(--ai-text-mute);
  }
}

.rs-foot {
  padding: 12px 4px 4px;
  font-size: 12px;
  color: var(--ai-text-mute);
}
</style>
