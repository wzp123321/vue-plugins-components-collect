// 单元格显示渲染器（非编辑态）：select→彩色 tag；number→数字 + 条件格式数据条；date→带图标文本
// 与 cells/index.ts 的 element-plus 编辑渲染器分开注册，由 registerAllRenderers 统一挂载。
//
// 本文件职责：把"非编辑态"单元格的原始值，按列类型渲染成更易读的展示内容：
//   - select：把选项值映射成稳定配色的彩色 tag（选项顺序即色板索引，保证同一选项颜色一致）；
//   - number：空值显示空白，否则显示数字；当开启条件格式（RT.conditionalOn）且本列有统计(min/max)时，
//     叠加一条按比例宽度的数据条（迷你条形图）；
//   - date：日期文本；
//   - 其它（text）：普通文本。
//
// 协作模块：
//   - ./runtime (RT)：提供条件格式开关 conditionalOn 与各列统计 colStat（min/max）；
//   - ./index.ts：通过 registerAllRenderers 把本渲染器注册为 vxe 的 'dt-cell-display'；
//   - 样式类 .dt-tag / .dt-num / .dt-bar-cell / .dt-date / .dt-text 由主组件 style 块提供（色值走 --dt-* → 全局 --bi-*）。
import { h } from 'vue';
import { RT } from './runtime';
import { DEFAULT_DATE_FORMAT } from '../../types';

// 把规范存储值（YYYY-MM-DD）按列配置格式展示：仅做 YYYY/MM/DD 令牌替换，
// 存储非规范值时回退原串（不强行构造）。dateFormat 只影响展示，不改存储。
const formatDate = (value: any, fmt?: string): string => {
  if (value == null || value === '') return '';
  const s = String(value);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return s;
  const f = fmt || DEFAULT_DATE_FORMAT;
  return f.replace(/YYYY/g, m[1]).replace(/MM/g, m[2]).replace(/DD/g, m[3]);
};

// select 选项色板：8 套固定配色，循环取用。顺序即"选项在列表中的索引"对应的颜色。
const TAG_PALETTE = [
  { bg: 'rgba(59,91,219,.14)', fg: '#2b5cf6', bd: 'rgba(59,91,219,.32)' },
  { bg: 'rgba(0,180,42,.14)', fg: '#00a62a', bd: 'rgba(0,180,42,.32)' },
  { bg: 'rgba(255,154,46,.16)', fg: '#d97700', bd: 'rgba(255,154,46,.36)' },
  { bg: 'rgba(245,63,63,.14)', fg: '#f53f3f', bd: 'rgba(245,63,63,.34)' },
  { bg: 'rgba(124,77,255,.14)', fg: '#7c4dff', bd: 'rgba(124,77,255,.34)' },
  { bg: 'rgba(0,174,197,.14)', fg: '#009eb0', bd: 'rgba(0,174,197,.34)' },
  { bg: 'rgba(232,67,147,.14)', fg: '#e84393', bd: 'rgba(232,67,147,.34)' },
  { bg: 'rgba(120,144,156,.16)', fg: '#5a6b78', bd: 'rgba(120,144,156,.36)' },
];
// 安全取色：对负索引也做了取模归一化（idx 为 -1 即"非选项值"时回落到最后一格灰色）
const tagColor = (idx: number) => TAG_PALETTE[((idx % TAG_PALETTE.length) + TAG_PALETTE.length) % TAG_PALETTE.length];

const renderCellDisplay = (renderOpts: any, params: any) => {
  const { row, column } = params;
  const field = column.field;
  const ctype = renderOpts.ctype;
  const value = row[field];
  // select：在可选项列表里找索引，映射到固定色板；找不到（idx=-1，例如脏数据）用末位灰
  if (ctype === 'select') {
    const opts: string[] = renderOpts.options || [];
    const idx = opts.indexOf(value);
    const c = tagColor(idx);
    return [h('span', { class: 'dt-tag', style: { background: c.bg, color: c.fg, borderColor: c.bd } }, value || '')];
  }
  if (ctype === 'number') {
    // 空串 / null / NaN 一律按"无值"处理（避免把非法值渲染成 NaN 文本）
    const num = value === null || value === '' || Number.isNaN(Number(value)) ? null : Number(value);
    if (num === null) return [h('span', { class: 'dt-num' }, '')];
    // 条件格式开启且本列有统计时，按 (num-min)/(max-min) 计算数据条占比
    if (RT.conditionalOn && RT.colStat[field]) {
      const { min, max } = RT.colStat[field];
      // max==min 时分母归零，直接给 0% 避免 Infinity/NaN
      const pct = max > min ? (num - min) / (max - min) : 0;
      return [h('div', { class: 'dt-bar-cell' }, [
        h('div', { class: 'dt-bar', style: { width: `${(pct * 100).toFixed(1)}%` } }),
        h('span', { class: 'dt-num' }, String(num)),
      ])];
    }
    return [h('span', { class: 'dt-num dt-num-plain' }, String(num))];
  }
  if (ctype === 'date') return [h('span', { class: 'dt-date' }, formatDate(value, renderOpts.dateFormat))];
  // 兜底：文本等其它类型，null/undefined 渲染为空串
  return [h('span', { class: 'dt-text' }, value == null ? '' : String(value))];
};

export { renderCellDisplay };
