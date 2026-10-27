/**
 * IoT 组态 —— 模拟实时数据总线
 *
 * 纯前端、零依赖的「设备数据点」模拟器：
 *  - 每个数据点(tag)在 正常 / 告警 / 停机 三种场景下有不同目标值；
 *  - 定时(600ms)向目标值平滑逼近并叠加噪声，制造「在线跳动」的真实感；
 *  - 超过阈值(warn)即产生报警；KPI 由当前值实时推导；
 *  - 通过 onTick 订阅，供 3D 引擎刷新浮动绑点标签。
 *
 * 这是模块级单例：组件与页面共享同一份响应式状态。
 */
import { reactive, computed } from 'vue';

export type Scenario = 'normal' | 'alarm' | 'stop';

export type DeviceKind = 'motor' | 'pump' | 'valve' | 'tank' | 'conveyor' | 'sensor';

export interface TagDef {
  key: string;
  device: string;
  label: string;
  unit: string;
  /** 各场景目标值 */
  normal: number;
  alarm: number;
  stop: number;
  /** 报警阈值（>= 即告警，停机场景不报警） */
  warn: number;
  /** 噪声幅度基准 */
  noise: number;
  decimals: number;
}

export interface BindDef {
  tag: string;
  prop: string;
  desc: string;
}

export interface DeviceDef {
  id: string;
  name: string;
  kind: DeviceKind;
  /** 绑点明细：哪个数据标签驱动设备的哪个可视属性 */
  bindings: BindDef[];
}

export const TAGS: TagDef[] = [
  // 电机
  { key: 'motor.rpm', device: 'motor', label: '转速', unit: 'rpm', normal: 1450, alarm: 1860, stop: 0, warn: 1750, noise: 18, decimals: 0 },
  { key: 'motor.temp', device: 'motor', label: '绕组温度', unit: '℃', normal: 64, alarm: 91, stop: 28, warn: 82, noise: 0.8, decimals: 0 },
  { key: 'motor.load', device: 'motor', label: '负载', unit: '%', normal: 68, alarm: 96, stop: 0, warn: 90, noise: 1.2, decimals: 0 },
  // 离心泵
  { key: 'pump.flow', device: 'pump', label: '出口流量', unit: 'm³/h', normal: 118, alarm: 162, stop: 0, warn: 150, noise: 2.2, decimals: 0 },
  { key: 'pump.pressure', device: 'pump', label: '出口压力', unit: 'bar', normal: 4.2, alarm: 5.6, stop: 0, warn: 5.2, noise: 0.06, decimals: 1 },
  { key: 'pump.temp', device: 'pump', label: '泵体温度', unit: '℃', normal: 52, alarm: 88, stop: 26, warn: 80, noise: 0.7, decimals: 0 },
  // 电动阀
  { key: 'valve.position', device: 'valve', label: '开度', unit: '%', normal: 60, alarm: 100, stop: 0, warn: 100, noise: 0.6, decimals: 0 },
  // 储液罐
  { key: 'tank.level', device: 'tank', label: '液位', unit: '%', normal: 58, alarm: 94, stop: 58, warn: 90, noise: 0.5, decimals: 0 },
  { key: 'tank.temp', device: 'tank', label: '介质温度', unit: '℃', normal: 38, alarm: 72, stop: 38, warn: 68, noise: 0.5, decimals: 0 },
  // 传送带
  { key: 'conveyor.speed', device: 'conveyor', label: '线速度', unit: 'm/s', normal: 1.25, alarm: 2.6, stop: 0, warn: 2.2, noise: 0.04, decimals: 2 },
  { key: 'conveyor.load', device: 'conveyor', label: '负载', unit: '%', normal: 54, alarm: 92, stop: 0, warn: 88, noise: 1.0, decimals: 0 },
  // 振动传感器（贴电机）
  { key: 'sensor.vibration', device: 'sensor', label: '振动', unit: 'mm/s', normal: 2.4, alarm: 8.6, stop: 0.2, warn: 7.5, noise: 0.15, decimals: 1 },
];

export const DEVICES: DeviceDef[] = [
  {
    id: 'motor',
    name: '主驱动电机',
    kind: 'motor',
    bindings: [
      { tag: 'motor.rpm', prop: '风扇/轴旋转速度', desc: '电机尾部冷却风扇随转速旋转' },
      { tag: 'motor.temp', prop: '壳体告警着色', desc: '超温时机壳转红告警' },
      { tag: 'motor.load', prop: '功率核算', desc: '参与系统总功率计算' },
    ],
  },
  {
    id: 'pump',
    name: '给水泵',
    kind: 'pump',
    bindings: [
      { tag: 'pump.flow', prop: '叶轮旋转速度', desc: '流量越大叶轮转得越快' },
      { tag: 'pump.pressure', prop: '出口压力指示', desc: '驱动压力读数' },
      { tag: 'pump.temp', prop: '壳体告警着色', desc: '超温告警' },
    ],
  },
  {
    id: 'valve',
    name: '电动调节阀',
    kind: 'valve',
    bindings: [
      { tag: 'valve.position', prop: '手轮转角', desc: '开度映射手轮旋转角度（0→关,100→全开）' },
    ],
  },
  {
    id: 'tank',
    name: '储液罐',
    kind: 'tank',
    bindings: [
      { tag: 'tank.level', prop: '液位高度', desc: '液面随液位百分比升降' },
      { tag: 'tank.temp', prop: '液体着色', desc: '温度升高液体偏橙' },
    ],
  },
  {
    id: 'conveyor',
    name: '输送带',
    kind: 'conveyor',
    bindings: [
      { tag: 'conveyor.speed', prop: '皮带/滚筒速度', desc: '线速驱动皮带滚动与料箱位移' },
      { tag: 'conveyor.load', prop: '料箱密度', desc: '负载越高料箱越密' },
    ],
  },
  {
    id: 'sensor',
    name: '振动传感器',
    kind: 'sensor',
    bindings: [
      { tag: 'sensor.vibration', prop: '探头脉冲强度', desc: '振动越大探头闪烁越强' },
    ],
  },
];

interface State {
  scenario: Scenario;
  values: Record<string, number>;
}

export const dataBus = reactive<State>({
  scenario: 'normal',
  values: {},
});

// 初始化为正常值
TAGS.forEach((t) => {
  dataBus.values[t.key] = t.normal;
});

const TAG_MAP: Record<string, TagDef> = Object.fromEntries(TAGS.map((t) => [t.key, t]));

const targetOf = (t: TagDef): number => {
  if (dataBus.scenario === 'alarm') return t.alarm;
  if (dataBus.scenario === 'stop') return t.stop;
  return t.normal;
};

let started = false;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

export const onTick = (cb: () => void): (() => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const tick = () => {
  TAGS.forEach((t) => {
    const tgt = targetOf(t);
    const cur = dataBus.values[t.key];
    const noise = dataBus.scenario === 'normal' ? (Math.random() - 0.5) * 2 * t.noise : 0;
    const next = cur + (tgt - cur) * 0.35 + noise;
    dataBus.values[t.key] = Math.max(0, next);
  });
  listeners.forEach((cb) => cb());
};

export const startBus = () => {
  if (started) return;
  started = true;
  tick();
  timer = setInterval(tick, 600);
};

export const stopBus = () => {
  if (timer) clearInterval(timer);
  timer = null;
  started = false;
};

export const setScenario = (s: Scenario) => {
  dataBus.scenario = s;
};

export interface AlarmItem {
  device: string;
  tag: string;
  label: string;
  value: number;
  unit: string;
  decimals: number;
}

export const alarms = computed<AlarmItem[]>(() => {
  if (dataBus.scenario === 'stop') return [];
  const list: AlarmItem[] = [];
  TAGS.forEach((t) => {
    const v = dataBus.values[t.key];
    if (v >= t.warn) {
      list.push({ device: t.device, tag: t.key, label: t.label, value: v, unit: t.unit, decimals: t.decimals });
    }
  });
  return list;
});

export const alarmsByDevice = computed<Record<string, boolean>>(() => {
  const m: Record<string, boolean> = {};
  alarms.value.forEach((a) => {
    m[a.device] = true;
  });
  return m;
});

export const deviceStatus = computed<Record<string, '运行' | '告警' | '待机'>>(() => {
  const m: Record<string, '运行' | '告警' | '待机'> = {};
  DEVICES.forEach((d) => {
    if (dataBus.scenario === 'stop') m[d.id] = '待机';
    else if (alarmsByDevice.value[d.id]) m[d.id] = '告警';
    else m[d.id] = '运行';
  });
  return m;
});

export interface Kpis {
  power: number;
  avgTemp: number;
  alarmCount: number;
}

export const kpis = computed<Kpis>(() => {
  const v = dataBus.values;
  const power =
    (v['motor.load'] / 100) * 42 +
    (v['pump.flow'] / 120) * 34 +
    (v['conveyor.load'] / 100) * 20 +
    (v['tank.level'] / 100) * 6 +
    (v['valve.position'] / 100) * 3;
  const avgTemp = (v['motor.temp'] + v['pump.temp'] + v['tank.temp']) / 3;
  return {
    power: Math.round(power * 10) / 10,
    avgTemp: Math.round(avgTemp * 10) / 10,
    alarmCount: alarms.value.length,
  };
});

export const fmt = (tag: string): string => {
  const t = TAG_MAP[tag];
  const val = dataBus.values[tag];
  return `${val.toFixed(t.decimals)} ${t.unit}`;
};
