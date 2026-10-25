import type { DeviceKind } from '@/components/three-iot-scene/dataBus'

export type { DeviceKind }

/** 画布上放置的一个设备实例 */
export interface PlacedDevice {
  uid: string
  kind: DeviceKind
  x: number
  y: number
  label: string
  /** 绑定的数据点 key（来自 dataBus.TAGS） */
  tagKey: string
}

/** 设备之间的连线（从右端口指向左端口，表示信号/动力联动） */
export interface Wire {
  id: string
  from: string
  to: string
}

/** 持久化布局 */
export interface Layout {
  devices: PlacedDevice[]
  wires: Wire[]
}
