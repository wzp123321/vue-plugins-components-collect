import VcLine from './vc-line.vue';
import VcBar from './vc-bar.vue';
import VcPie from './vc-pie.vue';
import VcScatter from './vc-scatter.vue';
import VcLive from './vc-live.vue';
import VcCombo from './vc-combo.vue';
import VcZoom from './vc-zoom.vue';
import VcCrosshair from './vc-crosshair.vue';
import VcTheme from './vc-theme.vue';

/** VChart 收集页注册表：壳页 vchart.vue 遍历渲染，新增图型在此挂载 */
export const customComponents = [
  { description: '折线图（smooth + area）', component: VcLine },
  { description: '柱状图（分组）', component: VcBar },
  { description: '饼图（环形）', component: VcPie },
  { description: '散点图', component: VcScatter },
  { description: '动态数据更新（updateSpec）', component: VcLive },
  { description: '双轴组合图（柱+线，左右双 Y 轴）', component: VcCombo },
  { description: '大数据缩略轴（1000 点 + dataZoom 滚动条）', component: VcZoom },
  { description: '十字准星交互（crosshair 轴指示）', component: VcCrosshair },
  { description: '明暗主题切换（updateSpec 切 theme）', component: VcTheme },
];
