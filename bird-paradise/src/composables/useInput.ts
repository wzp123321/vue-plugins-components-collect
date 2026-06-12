import { reactive } from "vue";
import type { PlayerInput, SeatIndex } from "../protocol";
import { SEAT_CONFIG } from "../game/config";

interface InputState {
  angle: number;
  multiplier: number;
  firing: boolean;
  left: boolean;
  right: boolean;
}

const input = reactive<Record<number, InputState>>({});

function ensure(seat: SeatIndex): InputState {
  if (!input[seat]) {
    input[seat] = {
      angle: -Math.PI / 2,
      multiplier: 100,
      firing: false,
      left: false,
      right: false,
    };
  }
  return input[seat]!;
}

function get(seat: SeatIndex): InputState | undefined {
  return input[seat];
}

function setMultiplier(seat: SeatIndex, mult: number): void {
  const s = ensure(seat);
  s.multiplier = Math.max(
    SEAT_CONFIG.multiplierMin,
    Math.min(SEAT_CONFIG.multiplierMax, Math.round(mult / 100) * 100),
  );
}

function bumpMultiplier(seat: SeatIndex, delta: number): void {
  setMultiplier(seat, ensure(seat).multiplier + delta);
}

function setFiring(seat: SeatIndex, on: boolean): void {
  ensure(seat).firing = on;
}

function setDir(seat: SeatIndex, dir: "left" | "right" | null): void {
  const s = ensure(seat);
  s.left = dir === "left";
  s.right = dir === "right";
}

function rotate(seat: SeatIndex, delta: number): void {
  const s = ensure(seat);
  let a = s.angle + delta;
  // 限制 [-PI + 0.1, -0.1]，炮台始终指向上半屏
  if (a < -Math.PI + 0.05) a = -Math.PI + 0.05;
  if (a > -0.05) a = -0.05;
  s.angle = a;
}

function build(seat: SeatIndex): PlayerInput {
  const s = ensure(seat);
  return {
    seat,
    angle: s.angle,
    multiplier: s.multiplier,
    firing: s.firing,
    t: Date.now(),
  };
}

export function useInput(seat: SeatIndex) {
  ensure(seat);
  return {
    state: input[seat] as InputState,
    ensure,
    get,
    setMultiplier,
    bumpMultiplier,
    setFiring,
    setDir,
    rotate,
    build: () => build(seat),
  };
}
