<template>
  <div class="gsap-page">
    <header class="gsap-page__head">
      <h3 class="gsap-page__title">GSAP 动画：时间轴编排与 stagger</h3>
      <p class="gsap-page__desc">
        CSS 动画做不了/不好做的场景：复杂时序编排、物理缓动、SVG 路径运动。依赖已装，直接可用。
      </p>
    </header>

    <section class="gsap-stage" ref="stageEl">
      <div class="gsap-stage__lane">
        <span class="gsap-dot" data-seq="1">1</span>
        <span class="gsap-dot" data-seq="2">2</span>
        <span class="gsap-dot" data-seq="3">3</span>
        <span class="gsap-dot" data-seq="4">4</span>
        <span class="gsap-dot" data-seq="5">5</span>
      </div>
      <div class="gsap-stage__hero">
        <div class="gsap-box gsap-box--a">A</div>
        <div class="gsap-box gsap-box--b">B</div>
        <div class="gsap-box gsap-box--c">C</div>
      </div>
    </section>

    <div class="gsap-page__actions">
      <button class="gsap-btn gsap-btn--primary" @click="playTimeline">▶ 播放时间轴</button>
      <button class="gsap-btn" @click="playStagger">⚡ stagger 批量入场</button>
      <button class="gsap-btn" @click="reset">↺ 复位</button>
    </div>

    <ul class="gsap-page__notes">
      <li>timeline 把多段动画串成一条时间轴，支持相对位置（&lt;&lt; 表示与上一段同时开始）</li>
      <li>stagger 一行代码让 N 个元素错峰入场，是列表/卡片动效性价比最高的写法</li>
      <li>ScrollTrigger 做滚动叙事（同包内，需 gsap.registerPlugin）；本项目 3D 地图的装饰层动画也可以迁移过来</li>
      <li>React/Vue 里用 gsap.context() 收集动画，卸载时统一 revert，防止内存泄漏</li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue';
import gsap from 'gsap';

defineOptions({ name: 'GsapAnimationDemo' });

const stageEl = ref<HTMLElement | null>(null);
let ctx: gsap.Context | null = null;

const withContext = (run: (scope: HTMLElement) => void) => {
  const scope = stageEl.value;
  if (!scope) return;
  ctx?.revert();
  ctx = gsap.context(() => run(scope), scope);
}

const playTimeline = () => {
  withContext((scope) => {
    const boxes = scope.querySelectorAll('.gsap-box');
    gsap
      .timeline({ defaults: { ease: 'power3.out', duration: 0.7 } })
      .from(boxes[0], { x: -220, opacity: 0, rotate: -45 })
      .from(boxes[1], { y: 120, opacity: 0, scale: 0.4 }, '<<0.15')
      .from(boxes[2], { x: 220, opacity: 0, rotate: 45 }, '<<0.15')
      .to(boxes, { scale: 1.08, duration: 0.25, stagger: 0.08, yoyo: true, repeat: 1 });
  });
}

const playStagger = () => {
  withContext((scope) => {
    gsap.from(scope.querySelectorAll('.gsap-dot'), {
      y: 46,
      opacity: 0,
      rotate: 90,
      scale: 0.3,
      duration: 0.55,
      ease: 'back.out(2)',
      stagger: { each: 0.09, from: 'center' },
    });
  });
}

const reset = () => {
  ctx?.revert();
  ctx = null;
}

onBeforeUnmount(() => {
  ctx?.revert();
  ctx = null;
});
</script>

<style lang="less" scoped>
.gsap-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;

  &__title {
    margin: 0 0 6px;
    color: var(--ai-text);
    font-size: 18px;
  }

  &__desc {
    margin: 0;
    color: var(--ai-text-dim);
    font-size: 13px;
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    gap: 10px;
  }

  &__notes {
    margin: 0;
    padding-left: 18px;
    color: var(--ai-text-mute);
    font-size: 11.5px;
    line-height: 1.9;
  }
}

.gsap-stage {
  padding: 34px 24px;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background:
    radial-gradient(600px 220px at 50% 0%, rgba(124, 92, 255, 0.12), transparent),
    var(--ai-surface);
  overflow: hidden;
}

.gsap-stage__lane {
  display: flex;
  justify-content: center;
  gap: 34px;
  margin-bottom: 34px;
}

.gsap-dot {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--ai-gradient-soft);
  border: 1px solid rgba(124, 92, 255, 0.4);
  color: var(--ai-text);
  font-family: var(--ai-font-mono);
  font-size: 14px;
}

.gsap-stage__hero {
  display: flex;
  justify-content: center;
  gap: 26px;
}

.gsap-box {
  display: grid;
  place-items: center;
  width: 74px;
  height: 74px;
  border-radius: 16px;
  font-size: 22px;
  font-weight: 600;
  color: #fff;

  &--a {
    background: linear-gradient(135deg, #a78bfa, #7c5cff);
  }

  &--b {
    background: linear-gradient(135deg, #22d3ee, #0891b2);
  }

  &--c {
    background: linear-gradient(135deg, #f472b6, #db2777);
  }
}

.gsap-btn {
  height: 36px;
  padding: 0 18px;
  border: 1px solid var(--ai-border);
  border-radius: 10px;
  background: var(--ai-surface);
  color: var(--ai-text-dim);
  font-size: 13px;
  cursor: pointer;

  &:hover {
    color: var(--ai-text);
  }

  &--primary {
    background: var(--ai-gradient);
    border: 0;
    color: #fff;
    font-weight: 500;
  }
}
</style>
