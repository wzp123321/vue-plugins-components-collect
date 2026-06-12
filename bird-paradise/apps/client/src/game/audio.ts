/** Web Audio 合成简单音效（无需外部资源） */
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  const C = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined
  if (!C) return null
  ctx = new C()
  return ctx
}

interface Opt { freq: number; type?: OscillatorType; dur: number; vol?: number; slide?: number }

function beep(o: Opt): void {
  const c = getCtx()
  if (!c) return
  const t0 = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = o.type || 'sine'
  osc.frequency.setValueAtTime(o.freq, t0)
  if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(80, o.freq + o.slide), t0 + o.dur)
  const vol = o.vol ?? 0.15
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + o.dur + 0.02)
}

function noise(dur: number, vol = 0.1, freq = 1200): void {
  const c = getCtx()
  if (!c) return
  const t0 = c.currentTime
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = c.createBufferSource()
  src.buffer = buf
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = freq
  const g = c.createGain()
  g.gain.setValueAtTime(vol, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(filter).connect(g).connect(c.destination)
  src.start(t0)
  src.stop(t0 + dur + 0.02)
}

export const sfx = {
  fire(): void { beep({ freq: 880, type: 'square', dur: 0.04, vol: 0.06 }) },
  hit(): void  { noise(0.06, 0.07, 600) },
  kill(): void { beep({ freq: 540, type: 'triangle', dur: 0.08, vol: 0.12, slide: 360 }) },
  bigKill(): void { beep({ freq: 320, type: 'sawtooth', dur: 0.18, vol: 0.16, slide: 520 }) },
  join(): void { beep({ freq: 660, type: 'triangle', dur: 0.18, vol: 0.10, slide: 220 }) },
  leave(): void { beep({ freq: 440, type: 'triangle', dur: 0.12, vol: 0.08, slide: -160 }) }
}

/** 必须在用户交互后调用（解锁音频） */
export function unlockAudio(): void {
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') c.resume().catch(() => {})
}
