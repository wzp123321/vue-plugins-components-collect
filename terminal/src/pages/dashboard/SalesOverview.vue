<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useInterval } from '../../hooks/useInterval';
import { getSalesTotal } from '../../utils/mockData';
import DigitalNumber from '../../components/DigitalNumber.vue';

const GOAL = 2000;
const total = ref(getSalesTotal());
useInterval(() => {
  total.value = getSalesTotal();
}, 5000);

const rate = computed(() => Math.min(100, (total.value / GOAL) * 100));

// SVG 环：基础 60% 长度，叠加 40% 进度
const R = 50;
const CIRC = 2 * Math.PI * R;
const dashOffset = computed(() => CIRC * (1 - 0.2 - 0.4 * (rate.value / 100)));
</script>

<template>
  <div class="sales-overview">
    <div class="sales-overview__main">
      <div class="sales-overview__label">今日累计销售额</div>
      <div class="sales-overview__value">
        <DigitalNumber :value="total" />
        <span class="sales-overview__unit">万元</span>
      </div>
      <div class="sales-overview__progress">
        <div class="sales-overview__bar">
          <div
            class="sales-overview__bar-fill"
            :style="{ width: `${rate}%` }"
          />
        </div>
        <div class="sales-overview__rate">
          达成率 <span class="text-primary">{{ rate.toFixed(1) }}%</span>
          <span class="text-muted"> / 目标 {{ GOAL }}万</span>
        </div>
      </div>
    </div>
    <div class="sales-overview__ring">
      <svg viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="rgba(64,158,255,0.15)"
          stroke-width="10"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="#4cf3ff"
          stroke-width="10"
          fill="none"
          stroke-linecap="round"
          :stroke-dasharray="CIRC"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div class="sales-overview__ring-text">
        <div class="sales-overview__ring-pct">{{ rate.toFixed(0) }}%</div>
        <div class="sales-overview__ring-hint">实时</div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.sales-overview {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0.1rem 0.16rem;

  &__main {
    flex: 1;
    min-width: 0;
  }
  &__label {
    font-size: 0.14rem;
    color: rgba(230, 241, 255, 0.65);
  }
  &__value {
    display: flex;
    align-items: baseline;
    gap: 0.06rem;
    margin-top: 0.06rem;
    font-size: 0.5rem;
    line-height: 1;
  }
  &__unit {
    font-size: 0.16rem;
    color: rgba(230, 241, 255, 0.7);
  }
  &__progress {
    margin-top: 0.12rem;
  }
  &__bar {
    width: 100%;
    height: 0.08rem;
    background: rgba(64, 158, 255, 0.15);
    border-radius: 0.04rem;
    overflow: hidden;
  }
  &__bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #409eff, #4cf3ff);
    box-shadow: 0 0 8px rgba(76, 243, 255, 0.6);
    transition: width 0.6s;
  }
  &__rate {
    margin-top: 0.06rem;
    font-size: 0.13rem;
    color: rgba(230, 241, 255, 0.7);
  }

  &__ring {
    position: relative;
    width: 1.4rem;
    height: 1.4rem;
    margin-left: 0.2rem;
  }
  svg {
    width: 100%;
    height: 100%;
  }

  &__ring-text {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  &__ring-pct {
    font-size: 0.24rem;
    font-weight: 700;
    color: #4cf3ff;
  }
  &__ring-hint {
    font-size: 0.12rem;
    color: rgba(230, 241, 255, 0.5);
  }
}
</style>
