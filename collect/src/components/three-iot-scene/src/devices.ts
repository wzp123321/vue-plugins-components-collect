/**
 * IoT 组态 —— 程序化设备几何
 *
 * 全部用 three 基础几何体「搭」出来，不依赖任何外部模型文件：
 * 每个设备返回 { group, labelOffset, update }，由场景引擎定位、驱动运转动画、报警着色。
 * update(v, dt, alarm, time) 每帧调用：v 为当前数据点值，dt 帧间隔，time 累计秒。
 */
import * as THREE from 'three';

export interface DeviceInstance {
  group: THREE.Group;
  labelOffset: THREE.Vector3;
  update: (v: Record<string, number>, dt: number, alarm: boolean, time: number) => void;
}

type Kind = 'motor' | 'pump' | 'valve' | 'tank' | 'conveyor' | 'sensor';

const std = (color: number, metalness = 0.6, roughness = 0.45): THREE.MeshStandardMaterial => new THREE.MeshStandardMaterial({ color, metalness, roughness });

const box = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0, shadow = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}

const cyl = (rt: number, rb: number, h: number, mat: THREE.Material, seg = 24): THREE.Mesh => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** 设备世界坐标（场景里一字排开 + 传送带在前方） */
export const DEVICE_POSITIONS: Record<Kind, [number, number, number]> = {
  motor: [-7, 0, 0],
  pump: [-2.4, 0, 0],
  valve: [2.2, 0, 0],
  tank: [6.6, 0, 0],
  conveyor: [0, 0, -5.5],
  sensor: [-7, 0, 2.4],
};

// ───────────────────────── 电机 ─────────────────────────
const buildMotor = (): DeviceInstance => {
  const g = new THREE.Group();
  const bodyMat = std(0x3b4a63, 0.55, 0.5);
  g.add(box(1.7, 0.22, 2.4, std(0x222a38), 0, 0.11, 0));
  const housing = box(1.5, 1.1, 2.2, bodyMat, 0, 0.92, 0);
  g.add(housing);
  g.add(box(0.5, 0.42, 0.42, std(0x2b3342), 0.86, 1.32, 0));
  // 风扇罩（朝 +z）
  const cover = cyl(0.56, 0.56, 0.08, std(0x1f2733));
  cover.rotation.x = Math.PI / 2;
  cover.position.set(0, 0.92, 1.16);
  g.add(cover);
  // 风扇（旋转）
  const fan = new THREE.Group();
  fan.position.set(0, 0.92, 1.24);
  const hub = cyl(0.12, 0.12, 0.1, std(0x6b7488));
  hub.rotation.x = Math.PI / 2;
  fan.add(hub);
  const bladeMat = std(0x9aa7bd, 0.4, 0.5);
  for (let i = 0; i < 5; i++) {
    const b = box(0.06, 0.5, 0.02, bladeMat);
    b.position.y = 0.22;
    b.rotation.y = 0.5;
    const pivot = new THREE.Group();
    pivot.rotation.z = (i / 5) * Math.PI * 2;
    pivot.add(b);
    fan.add(pivot);
  }
  g.add(fan);
  // 尾轴
  const shaft = cyl(0.08, 0.08, 0.6, std(0x6b7488));
  shaft.rotation.x = Math.PI / 2;
  shaft.position.set(0, 0.92, -1.25);
  g.add(shaft);

  return {
    group: g,
    labelOffset: new THREE.Vector3(0, 2.3, 0),
    update(v, dt) {
      const rpm = v['motor.rpm'] || 0;
      fan.rotation.z += Math.min(rpm / 1450, 3) * dt * 7;
      const temp = v['motor.temp'] || 0;
      const tn = THREE.MathUtils.clamp((temp - 40) / 55, 0, 1);
      bodyMat.emissive.setRGB(tn * 0.5, tn * 0.08, 0);
    },
  };
}

// ───────────────────────── 离心泵 ─────────────────────────
const buildPump = (): DeviceInstance => {
  const g = new THREE.Group();
  g.add(box(1.7, 0.22, 1.5, std(0x222a38), 0, 0.11, 0));
  const voluteMat = std(0x46566f, 0.55, 0.5);
  const volute = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.22, 16, 36), voluteMat);
  volute.position.set(0, 0.95, 0);
  volute.castShadow = true;
  g.add(volute);
  // 透明端盖（看得到叶轮）
  const cover = cyl(0.64, 0.64, 0.12, new THREE.MeshStandardMaterial({ color: 0x9fc4ff, metalness: 0.1, roughness: 0.1, transparent: true, opacity: 0.32 }));
  cover.rotation.x = Math.PI / 2;
  cover.position.set(0, 0.95, 0.26);
  g.add(cover);
  // 叶轮（旋转）
  const imp = new THREE.Group();
  imp.position.set(0, 0.95, 0.2);
  const hub = cyl(0.12, 0.12, 0.12, std(0xb9c4d6));
  hub.rotation.x = Math.PI / 2;
  imp.add(hub);
  const bladeMat = std(0xb9c4d6, 0.5, 0.4);
  for (let i = 0; i < 6; i++) {
    const b = box(0.05, 0.42, 0.04, bladeMat);
    b.position.y = 0.18;
    b.rotation.y = 0.6;
    const p = new THREE.Group();
    p.rotation.z = (i / 6) * Math.PI * 2;
    p.add(b);
    imp.add(p);
  }
  g.add(imp);
  // 进出管
  const pipeMat = std(0x3a4a60, 0.5, 0.5);
  const inlet = cyl(0.18, 0.18, 0.9, pipeMat);
  inlet.position.set(0, 1.5, 0);
  g.add(inlet);
  const outlet = cyl(0.16, 0.16, 0.9, pipeMat);
  outlet.rotation.z = Math.PI / 2;
  outlet.position.set(0.9, 0.95, 0);
  g.add(outlet);
  const flange = cyl(0.26, 0.26, 0.08, std(0x2b3342));
  flange.position.set(1.34, 0.95, 0);
  flange.rotation.z = Math.PI / 2;
  g.add(flange);

  return {
    group: g,
    labelOffset: new THREE.Vector3(0, 2.2, 0),
    update(v, dt, alarm) {
      const flow = v['pump.flow'] || 0;
      imp.rotation.z += Math.min(flow / 118, 3) * dt * 9;
      const temp = v['pump.temp'] || 0;
      const tn = THREE.MathUtils.clamp((temp - 40) / 50, 0, 1);
      const e = alarm ? 0.85 : tn * 0.5;
      voluteMat.emissive.setRGB(e, e * 0.12, 0);
    },
  };
}

// ───────────────────────── 电动阀 ─────────────────────────
const buildValve = (): DeviceInstance => {
  const g = new THREE.Group();
  const pipeMat = std(0x3a4a60, 0.5, 0.5);
  const left = cyl(0.22, 0.22, 1.4, pipeMat);
  left.rotation.z = Math.PI / 2;
  left.position.set(-0.9, 0.9, 0);
  g.add(left);
  const right = left.clone();
  right.position.set(0.9, 0.9, 0);
  g.add(right);
  const bodyMat = std(0x46566f, 0.55, 0.45);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), bodyMat);
  body.position.set(0, 0.9, 0);
  body.castShadow = true;
  g.add(body);
  const stem = cyl(0.05, 0.05, 0.5, std(0x6b7488));
  stem.position.set(0, 1.3, 0);
  g.add(stem);
  // 手轮（红，旋转）
  const wheel = new THREE.Group();
  wheel.position.set(0, 1.6, 0);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 12, 32), std(0xc23b3b, 0.3, 0.5));
  ring.rotation.x = Math.PI / 2;
  wheel.add(ring);
  const spokeMat = std(0xc23b3b, 0.3, 0.5);
  for (let i = 0; i < 3; i++) {
    const s = box(0.62, 0.04, 0.04, spokeMat);
    s.rotation.y = (i / 3) * Math.PI;
    wheel.add(s);
  }
  g.add(wheel);
  const flangeMat = std(0x2b3342);
  [-1.58, 1.58].forEach((x) => {
    const f = cyl(0.3, 0.3, 0.08, flangeMat);
    f.rotation.z = Math.PI / 2;
    f.position.set(x, 0.9, 0);
    g.add(f);
  });

  return {
    group: g,
    labelOffset: new THREE.Vector3(0, 2.1, 0),
    update(v, _dt, alarm) {
      const pos = v['valve.position'] || 0;
      wheel.rotation.y = (pos / 100) * Math.PI * 1.6;
      // 开度着色：全开卡死(告警)红，关闭暗红，开绿色
      if (alarm) bodyMat.emissive.setRGB(0.9, 0.1, 0.05);
      else if (pos < 5) bodyMat.emissive.setRGB(0.35, 0.04, 0.02);
      else bodyMat.emissive.setRGB(0.04, 0.3, 0.12);
    },
  };
}

// ───────────────────────── 储液罐 ─────────────────────────
const buildTank = (): DeviceInstance => {
  const g = new THREE.Group();
  const base = cyl(1.0, 1.0, 0.15, std(0x2b3445));
  base.position.y = 0.075;
  g.add(base);
  const shellMat = new THREE.MeshStandardMaterial({ color: 0x8fd0ff, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.16, side: THREE.DoubleSide });
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 3.0, 40, 1, true), shellMat);
  shell.position.y = 1.65;
  g.add(shell);
  const capMat = std(0x39465a, 0.5, 0.5);
  const top = cyl(0.9, 0.9, 0.08, capMat);
  top.position.y = 3.2;
  g.add(top);
  const bot = cyl(0.9, 0.9, 0.08, capMat);
  bot.position.y = 0.15;
  g.add(bot);
  const liquidMat = new THREE.MeshStandardMaterial({ color: 0x2f7fe0, metalness: 0.1, roughness: 0.2, transparent: true, opacity: 0.6 });
  const liquid = cyl(0.86, 0.86, 3.0, liquidMat, 40);
  liquid.position.y = 0.15 + 1.5;
  g.add(liquid);
  // 侧位液位计
  const tube = cyl(0.05, 0.05, 3.0, new THREE.MeshStandardMaterial({ color: 0x223, transparent: true, opacity: 0.3 }));
  tube.position.set(0.98, 1.65, 0);
  g.add(tube);

  const cBlue = new THREE.Color(0x2f7fe0);
  const cHot = new THREE.Color(0xe07a2f);
  return {
    group: g,
    labelOffset: new THREE.Vector3(0, 3.6, 0),
    update(v) {
      const level = v['tank.level'] || 0;
      const h = (3.0 * level) / 100;
      liquid.scale.y = Math.max(h, 0.001) / 3.0;
      liquid.position.y = 0.15 + h / 2;
      const temp = v['tank.temp'] || 0;
      const tn = THREE.MathUtils.clamp((temp - 30) / 50, 0, 1);
      liquidMat.color.copy(cBlue).lerp(cHot, tn);
    },
  };
}

// ───────────────────────── 输送带 ─────────────────────────
const buildConveyor = (): DeviceInstance => {
  const g = new THREE.Group();
  const frameMat = std(0x36404f, 0.4, 0.6);
  [-2.3, 2.3].forEach((x) => g.add(box(0.18, 0.7, 1.4, std(0x222a38), x, 0.35, 0)));
  g.add(box(5, 0.3, 1.3, frameMat, 0, 0.7, 0));
  const belt = box(5, 0.08, 1.1, std(0x14181f, 0.2, 0.8), 0, 0.88, 0, false);
  g.add(belt);
  [-0.55, 0.55].forEach((z) => g.add(box(5, 0.12, 0.06, std(0x59657d), 0, 0.98, z)));
  const rollerMat = std(0x8a93a6, 0.6, 0.4);
  const rollers: THREE.Mesh[] = [];
  [-2.4, 2.4].forEach((x) => {
    const r = cyl(0.18, 0.18, 1.1, rollerMat);
    r.rotation.z = Math.PI / 2;
    r.position.set(x, 0.84, 0);
    g.add(r);
    rollers.push(r);
  });
  const crateMat = std(0xc8923b, 0.2, 0.7);
  const crates: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const c = box(0.42, 0.42, 0.42, crateMat, -2.4 + i * 0.85, 1.13, 0);
    c.castShadow = true;
    g.add(c);
    crates.push(c);
  }

  return {
    group: g,
    labelOffset: new THREE.Vector3(0, 1.7, 0),
    update(v, dt) {
      const speed = v['conveyor.speed'] || 0;
      const load = v['conveyor.load'] || 0;
      const visible = Math.max(1, Math.round((load / 100) * 6));
      rollers.forEach((r) => { r.rotation.x += speed * dt * 6; });
      crates.forEach((c, i) => {
        c.visible = i < visible;
        if (!c.visible) return;
        c.position.x += speed * dt * 1.6;
        if (c.position.x > 2.5) c.position.x -= 5.0;
      });
    },
  };
}

// ───────────────────────── 振动传感器 ─────────────────────────
const buildSensor = (): DeviceInstance => {
  const g = new THREE.Group();
  g.add(box(0.3, 0.12, 0.3, std(0x222a38), 0, 0.06, 0));
  const post = cyl(0.05, 0.05, 1.0, std(0x55607a));
  post.position.y = 0.56;
  g.add(post);
  const headMat = new THREE.MeshStandardMaterial({ color: 0x39e0ff, emissive: 0x39e0ff, emissiveIntensity: 0.6, metalness: 0.2, roughness: 0.3 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), headMat);
  head.position.y = 1.12;
  g.add(head);

  return {
    group: g,
    labelOffset: new THREE.Vector3(0, 1.6, 0),
    update(v, _dt, alarm, time) {
      const vib = v['sensor.vibration'] || 0;
      const pulse = 1 + 0.35 * Math.sin(time * (2 + vib * 3));
      head.scale.setScalar(pulse);
      headMat.emissiveIntensity = 0.4 + Math.min(vib / 8, 1) * 1.6;
      headMat.emissive.set(alarm ? 0xff5a3c : 0x39e0ff);
      headMat.color.set(alarm ? 0xff5a3c : 0x39e0ff);
    },
  };
}

const BUILDERS: Record<Kind, () => DeviceInstance> = {
  motor: buildMotor,
  pump: buildPump,
  valve: buildValve,
  tank: buildTank,
  conveyor: buildConveyor,
  sensor: buildSensor,
};

export const buildDevice = (kind: Kind): DeviceInstance => BUILDERS[kind]();
