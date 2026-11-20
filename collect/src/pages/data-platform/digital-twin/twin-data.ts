/**
 * 数字孪生 —— 演示数据
 * ============================================================================
 * 设备台账直接复用 three-iot-scene 的 DEVICES / TAGS（同一套设备定义与阈值），
 * 这里只补「业务侧」字段：状态、能耗占比、时序趋势、告警摘要。
 *
 * 状态三档与 3D 材质、图表配色共用 TWIN_STATUS_COLOR，保证两边颜色永远一致。
 */
import { DEVICES, TAGS, type DeviceKind } from '@/components/three-iot-scene/dataBus';

export type TwinStatus = 'normal' | 'warn' | 'alarm';

export const TWIN_STATUS_COLOR: Record<TwinStatus, string> = {
  normal: '#38d39f',
  warn: '#f5a623',
  alarm: '#ff5a3c',
};

export const TWIN_STATUS_LABEL: Record<TwinStatus, string> = {
  normal: '运行正常',
  warn: '预警',
  alarm: '告警',
};

/** 演示用的设备状态与能耗占比（占比合计 100） */
const DEVICE_STATE: Record<string, { status: TwinStatus; share: number }> = {
  motor: { status: 'normal', share: 28 },
  pump: { status: 'normal', share: 21 },
  valve: { status: 'normal', share: 17 },
  tank: { status: 'warn', share: 14 },
  conveyor: { status: 'normal', share: 13 },
  sensor: { status: 'alarm', share: 7 },
};

export interface TwinDevice {
  id: string;
  name: string;
  kind: DeviceKind;
  status: TwinStatus;
  /** 主数据点（取该设备第一个绑定点） */
  tagKey: string;
  tagLabel: string;
  unit: string;
  decimals: number;
  /** 当前值（演示取该数据点的正常值，3D 里会做轻微波动） */
  value: number;
  /** 能耗占比 % */
  share: number;
}

export const TWIN_DEVICES: TwinDevice[] = DEVICES.map((device) => {
  const tag = TAGS.find((item) => item.device === device.id) ?? TAGS[0];
  const state = DEVICE_STATE[device.id] ?? { status: 'normal' as TwinStatus, share: 0 };
  return {
    id: device.id,
    name: device.name,
    kind: device.kind,
    status: state.status,
    tagKey: tag.key,
    tagLabel: tag.label,
    unit: tag.unit,
    decimals: tag.decimals,
    value: tag.normal,
    share: state.share,
  };
});

export const deviceById = (id: string): TwinDevice =>
  TWIN_DEVICES.find((device) => device.id === id) ?? TWIN_DEVICES[0];

/** 该设备挂的全部数据点（喂给 3D 动画的 values） */
export const tagsOfDevice = (id: string) => TAGS.filter((tag) => tag.device === id);

const noise = (seed: number): number => {
  const x = Math.sin(seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** 24 点时序（末点对齐当前值），用于选中设备的趋势图 */
export const trendOf = (device: TwinDevice): { time: string; value: number }[] => {
  const points = 24;
  return Array.from({ length: points }, (_, index) => {
    const remain = points - 1 - index;
    const wave = Math.sin((index / points) * Math.PI * 2) * device.value * 0.06;
    const jitter = (noise(index + device.id.length * 7) - 0.5) * device.value * 0.05;
    const anchor = device.value * (1 - remain * 0.004);
    const time = `${String(9 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'}`;
    return { time, value: Number((anchor + wave + jitter).toFixed(device.decimals)) };
  });
};

/** 告警摘要：非正常状态的设备 + 其超出阈值的数据点 */
export const alarmList = TWIN_DEVICES.filter((device) => device.status !== 'normal').map((device) => {
  const tag = TAGS.find((item) => item.key === device.tagKey) ?? TAGS[0];
  return {
    id: device.id,
    name: device.name,
    status: device.status,
    label: tag.label,
    value: device.status === 'alarm' ? Number((tag.warn * 1.12).toFixed(tag.decimals)) : Number(tag.warn.toFixed(tag.decimals)),
    unit: tag.unit,
    limit: tag.warn,
  };
});

export const STATUS_SUMMARY = (['normal', 'warn', 'alarm'] as TwinStatus[]).map((status) => ({
  status,
  label: TWIN_STATUS_LABEL[status],
  color: TWIN_STATUS_COLOR[status],
  count: TWIN_DEVICES.filter((device) => device.status === status).length,
}));
