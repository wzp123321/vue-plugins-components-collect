// 单元格显示渲染器（非编辑态）：select→彩色 tag；number→数字 + 条件格式数据条；date→带图标文本
// 与 cells/index.ts 的 element-plus 编辑渲染器分开注册，由 registerAllRenderers 统一挂载。
import { h } from 'vue';
import { RT } from './runtime';

const TAG_PALETTE = [
  { bg: 'rgba(59,91,219,.14)', fg: '#3b5bdb', bd: 'rgba(59,91,219,.32)' },
  { bg: 'rgba(0,180,42,.14)', fg: '#00a62a', bd: 'rgba(0,180,42,.32)' },
  { bg: 'rgba(255,154,46,.16)', fg: '#d97700', bd: 'rgba(255,154,46,.36)' },
  { bg: 'rgba(245,63,63,.14)', fg: '#f53f3f', bd: 'rgba(245,63,63,.34)' },
  { bg: 'rgba(124,77,255,.14)', fg: '#7c4dff', bd: 'rgba(124,77,255,.34)' },
  { bg: 'rgba(0,174,197,.14)', fg: '#009eb0', bd: 'rgba(0,174,197,.34)' },
  { bg: 'rgba(232,67,147,.14)', fg: '#e84393', bd: 'rgba(232,67,147,.34)' },
  { bg: 'rgba(120,144,156,.16)', fg: '#5a6b78', bd: 'rgba(120,144,156,.36)' },
];
const tagColor = (idx: number) => TAG_PALETTE[((idx % TAG_PALETTE.length) + TAG_PALETTE.length) % TAG_PALETTE.length];

const renderCellDisplay = (renderOpts: any, params: any) => {
  const { row, column } = params;
  const field = column.field;
  const ctype = renderOpts.ctype;
  const value = row[field];
  if (ctype === 'select') {
    const opts: string[] = renderOpts.options || [];
    const idx = opts.indexOf(value);
    const c = tagColor(idx);
    return [h('span', { class: 'dt-tag', style: { background: c.bg, color: c.fg, borderColor: c.bd } }, value || '')];
  }
  if (ctype === 'number') {
    const num = value === null || value === '' || isNaN(Number(value)) ? null : Number(value);
    if (num === null) return [h('span', { class: 'dt-num' }, '')];
    if (RT.conditionalOn && RT.colStat[field]) {
      const { min, max } = RT.colStat[field];
      const pct = max > min ? (num - min) / (max - min) : 0;
      return [h('div', { class: 'dt-bar-cell' }, [
        h('div', { class: 'dt-bar', style: { width: (pct * 100).toFixed(1) + '%' } }),
        h('span', { class: 'dt-num' }, String(num)),
      ])];
    }
    return [h('span', { class: 'dt-num dt-num-plain' }, String(num))];
  }
  if (ctype === 'date') return [h('span', { class: 'dt-date' }, value || '')];
  return [h('span', { class: 'dt-text' }, value == null ? '' : String(value))];
};

export { renderCellDisplay };
