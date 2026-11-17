// 单元格显示渲染器（非编辑态）：select→彩色 tag；number→数字；region→院区名称；date→日期文本
// 与 cells/index.ts 的 element-plus 编辑渲染器分开注册，由 registerAllRenderers 统一挂载。
//
// 本文件职责：把"非编辑态"单元格的原始值，按列类型渲染成更易读的展示内容：
//   - select：把选项值映射成稳定配色的彩色 tag（选项顺序即色板索引，保证同一选项颜色一致）；
//   - number：空值显示空白，否则显示数字；
//   - region：院区对象取 name（与 Univer 展示口径一致，避免显示 [object Object]）；
//   - date：日期文本；
//   - 其它（text）：普通文本。
//
// 协作模块：
//   - ./index.ts：通过 registerAllRenderers 把本渲染器注册为 vxe 的 'dt-cell-display'；
//   - 样式类 .dt-tag / .dt-num / .dt-region / .dt-date / .dt-text 由主组件 style 块提供（色值走 --dt-* → 全局 --bi-*）。
import { h } from 'vue';
import { renderDate } from '@/utils/bi-entry';
import { isRegionValue } from '@/pages/data-platform/univer-entry/region-data';

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
    return [h('span', { class: 'dt-num dt-num-plain' }, String(num))];
  }
  // 院区存的是结构化对象 { name, id, code }：只显示 name，其余随数据保留
  if (ctype === 'region') {
    let text = '';
    if (isRegionValue(value)) text = value.name;
    else if (value != null) text = String(value);
    return [h('span', { class: 'dt-region dt-text' }, text)];
  }
  if (ctype === 'date') return [h('span', { class: 'dt-date' }, renderDate(value, renderOpts.dateFormat))];
  // 兜底：文本等其它类型，null/undefined 渲染为空串；
  // 列类型由 region 改成 text 后残留的院区对象仍显示 name，避免出现 [object Object]
  let text = '';
  if (value != null) text = isRegionValue(value) ? value.name : String(value);
  return [h('span', { class: 'dt-text' }, text)];
};

export { renderCellDisplay };
