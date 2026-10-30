<!--
 * MapDetailPanel.vue — 右侧「区域详情」面板（3D ↔ 图表数据交互）
 * ---------------------------------------------------------------
 * 职责：监听 ChinaMap3D 当前层级，把该层级的「下级行政区 + 项目数」渲染成横向
 *   条形图；点击某条 → 反向驱动 3D 地图下钻到该区域；悬浮 → 在 3D 中高亮。
 * 这是 mega-vision 里 detail-* 钻取面板的精简版，专门演示「3D 与图表的数据交互」：
 *   3D 双击下钻  →  面板自动跟随出图；
 *   面板点条      →  3D 反向下钻 / 高亮。
 * 协作：threejs-china-3d-map.vue（持有 mapRef，把 ChinaMap3D 的 currentLevel()
 *   与 projectData 折算成 subRegions 传入，并把 drill/select/reset 事件转调 ref API）。
 * 样式：沿用右上角可视化控制台的玻璃拟态 + 青光风格，与整屏大屏统一。
 -->
<template>
  <div class="map-detail" :class="{ 'map-detail--collapsed': collapsed }">
    <div class="map-detail__head" @click="collapsed = !collapsed">
      <span class="map-detail__pulse"></span>
      <span class="map-detail__title">区域详情</span>
      <span class="map-detail__level">{{ levelText }}</span>
      <span class="map-detail__chev">{{ collapsed ? '▸' : '▾' }}</span>
    </div>

    <div v-show="!collapsed" class="map-detail__body">
      <div class="map-detail__name">
        <span class="map-detail__name-main">{{ regionName || '全国' }}</span>
        <button v-if="regionLevel !== 'country'" type="button" class="map-detail__back" @click.stop="onReset">
          返回全国
        </button>
      </div>

      <div class="map-detail__stat">
        <span class="map-detail__stat-label">下级</span>
        <span class="map-detail__stat-num">{{ subRegions.length }}</span>
        <span class="map-detail__stat-label">项目总数</span>
        <span class="map-detail__stat-num">{{ total }}</span>
      </div>

      <div class="map-detail__viewToggle">
        <button type="button" :class="{ 'is-on': viewMode === 'bar' }" @click="viewMode = 'bar'">条形</button>
        <button type="button" :class="{ 'is-on': viewMode === 'table' }" @click="viewMode = 'table'">明细表</button>
      </div>

      <div v-show="viewMode === 'bar'" class="map-detail__bars">
        <button
          v-for="r in subRegions"
          :key="r.adcode"
          type="button"
          class="map-detail__bar"
          :class="{ 'map-detail__bar--active': r.adcode === selectedAdcode }"
          :title="r.drillable ? '点击下钻到该区域' : '最末级，点击高亮'"
          @click.stop="onBarClick(r)"
          @mouseenter="onBarEnter(r)"
          @mouseleave="onBarLeave"
        >
          <span
            class="map-detail__bar-fill"
            :style="{ width: pct(r.value) + '%', background: barColor(r.value) }"
          ></span>
          <span class="map-detail__bar-name">{{ r.name }}</span>
          <span class="map-detail__bar-value">{{ r.value }}</span>
        </button>
        <div v-if="!subRegions.length" class="map-detail__empty">已到最末级，无下级区域</div>
      </div>

      <!-- 明细表：选中区域的下级行政区清单（排名 / 名称 / 项目数 / 占比），条形图的表格化呈现 -->
      <div v-show="viewMode === 'table'" class="map-detail__table">
        <el-table :data="subRegions" size="small" height="100%" @row-click="onRowClick" highlight-current-row>
          <el-table-column type="index" label="#" width="34" />
          <el-table-column prop="name" label="区域" min-width="84" show-overflow-tooltip />
          <el-table-column prop="value" label="项目数" width="64" align="right" sortable />
          <el-table-column label="占比" width="58" align="right">
            <template #default="{ row }">{{ share(row.value) }}%</template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="!subRegions.length && viewMode === 'table'" class="map-detail__empty">已到最末级，无下级区域</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface SubRegion {
  adcode: number;
  name: string;
  value: number;
  drillable: boolean;
}

const props = defineProps<{
  regionName: string;
  regionLevel: string;
  levelText: string;
  subRegions: SubRegion[];
  total: number;
  selectedAdcode: number | null;
  maxValue: number;
}>();

const emit = defineEmits<{
  (e: 'drill', adcode: number): void;
  (e: 'select', adcode: number | null): void;
  (e: 'reset'): void;
}>();

// 默认悬浮（收起小卡），点击标题栏展开/收起，避免遮挡大屏地图。
const collapsed = ref(true);
/** 下级展示形态：条形图 / 明细表（表格化呈现，便于精确比对数值） */
const viewMode = ref<'bar' | 'table'>('bar');
/** 占比：相对当前层级项目总量，单位 %（保留 1 位） */
const share = (v: number) => (props.total > 0 ? ((v / props.total) * 100).toFixed(1) : '0.0');
/** 明细表点行 / 条点击：可下钻则下钻，否则联动地图高亮（同一语义，故共用一份判断） */
const emitPick = (row: SubRegion) => {
  if (row.drillable) emit('drill', row.adcode);
  else emit('select', row.adcode);
};
const onRowClick = (row: SubRegion) => emitPick(row);
const onBarClick = (row: SubRegion) => emitPick(row);
/** 条悬浮 / 移出：地图侧同步高亮 / 取消高亮 */
const onBarEnter = (row: SubRegion) => emit('select', row.adcode);
const onBarLeave = () => emit('select', null);
/** 返回全国 */
const onReset = () => emit('reset');

/** 条形宽度：相对最大值归一化，最小 4% 保证可见 */
const pct = (v: number) => (props.maxValue > 0 ? Math.max(4, (v / props.maxValue) * 100) : 0);

/** 条形配色：与地图数据柱同一套「深蓝→青光」插值，越高越亮 */
const barColor = (v: number) => {
  const ratio = props.maxValue > 0 ? v / props.maxValue : 0;
  const k = 0.3 + 0.7 * Math.min(1, ratio);
  const from = [15, 58, 87]; // #0F3A57
  const to = [95, 201, 238]; // #5FC9EE
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * k));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};
</script>

<style scoped>
.map-detail {
  /* 位置由外部 .china3d-rail 的纵向排列决定，这里不写 top/right */
  position: relative;
  /* 吃掉控制台与看板之间的剩余空间；窗口变矮时自动压缩，条列表内部滚动 */
  flex: 1 1 0;
  width: 300px;
  min-height: 130px;
  display: flex;
  flex-direction: column;
  padding: 12px 14px 14px;
  background: rgba(6, 16, 40, 0.8);
  border: 1px solid rgba(95, 216, 255, 0.22);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow:
    0 10px 34px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  color: #dcefff;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
}
.map-detail--collapsed {
  flex: 0 0 auto;
  width: auto;
  min-height: 0;
  /* 折叠态贴到栏底：与控制台（贴顶）分成「设置区 / 数据区」两组，
     中间那段空白留给地图，不要出现一颗小胶囊孤零零悬在半空。
     注意 auto margin 只在折叠态写 —— 展开态要留给 flex-grow 撑满剩余高度。 */
  margin-top: auto;
}
.map-detail__head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #eaf6ff;
  text-shadow: 0 0 10px rgba(54, 224, 255, 0.5);
}
.map-detail__pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5fd8ff;
  box-shadow: 0 0 8px #5fd8ff;
  animation: map-detail-blink 1.6s ease-in-out infinite;
}
@keyframes map-detail-blink {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
.map-detail__title {
  flex: 1;
}
.map-detail__level {
  font-size: 11px;
  color: #6f9fc4;
  font-weight: 400;
  letter-spacing: 0;
}
.map-detail__chev {
  font-size: 12px;
  color: #6f9fc4;
}
.map-detail__body {
  margin-top: 8px;
  /* 撑满面板剩余高度，把压力传给下面的条列表（由它滚动） */
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.map-detail__name {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.map-detail__name-main {
  font-size: 15px;
  font-weight: 700;
  color: #eaf6ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.map-detail__back {
  flex: 0 0 auto;
  padding: 3px 10px;
  border: 1px solid rgba(95, 216, 255, 0.4);
  border-radius: var(--ai-radius-sm);
  background: rgba(47, 192, 255, 0.16);
  color: #a9dcf2;
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
}
.map-detail__back:hover {
  background: rgba(47, 192, 255, 0.3);
  color: #eaf6ff;
}
.map-detail__stat {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 6px;
  font-size: 12px;
  color: #8fb8d6;
}
.map-detail__stat-num {
  color: #fff;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.map-detail__bars {
  /* 唯一可滚动的部分：面板被压矮时这里出现滚动条 */
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-right: 2px;
}
.map-detail__bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border: none;
  border-radius: var(--ai-radius-sm);
  background: rgba(120, 150, 180, 0.08);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  overflow: hidden;
}
.map-detail__bar:hover {
  background: rgba(120, 150, 180, 0.18);
}
.map-detail__bar--active {
  box-shadow: inset 0 0 0 1px rgba(95, 216, 255, 0.6);
}
.map-detail__bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  opacity: 0.28;
  border-radius: var(--ai-radius-sm);
}
.map-detail__bar-name {
  position: relative;
  flex: 1;
  font-size: 12px;
  color: #dcefff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.map-detail__bar-value {
  position: relative;
  font-size: 12px;
  color: #fff;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.map-detail__empty {
  font-size: 12px;
  color: #6f9fc4;
  padding: 8px 2px;
}
/* ---- 视图切换（条形 / 明细表） ---- */
.map-detail__viewToggle {
  flex: 0 0 auto;
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}
.map-detail__viewToggle button {
  flex: 1;
  padding: 4px 0;
  border: 1px solid rgba(95, 216, 255, 0.25);
  border-radius: var(--ai-radius-sm);
  background: rgba(120, 150, 180, 0.08);
  color: #9fc4e0;
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
}
.map-detail__viewToggle button.is-on {
  background: rgba(47, 192, 255, 0.2);
  color: #eaf6ff;
  border-color: rgba(95, 216, 255, 0.6);
}
/* ---- 明细表 ---- */
.map-detail__table {
  /* 跟着面板剩余高度走（el-table height="100%" 内部滚动），别写死 220 撑破卡片 */
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
.map-detail__table :deep(.el-table) {
  background: transparent;
  font-size: 12px;
  color: #dcefff;
}
.map-detail__table :deep(.el-table tr),
.map-detail__table :deep(.el-table th),
.map-detail__table :deep(.el-table td) {
  background: transparent !important;
  color: #dcefff;
}
.map-detail__table :deep(.el-table__row) {
  cursor: pointer;
}
.map-detail__table :deep(.el-table--small .cell) {
  padding: 0 4px;
}
</style>
