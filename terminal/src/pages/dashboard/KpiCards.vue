<script lang="ts" setup>
import { ref } from 'vue';
import { getKpiCards } from '../../utils/mockData';
import { useInterval } from '../../hooks/useInterval';
import DigitalNumber from '../../components/DigitalNumber.vue';

const list = ref(getKpiCards());
useInterval(() => {
  list.value = getKpiCards();
}, 5000);

const ICONS: Record<string, string> = {
  '￥': 'M3 6h18M3 12h12M3 18h18',
  'U': 'M16 7a4 4 0 1 0-8 0M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2',
  'O': 'M3 3h2l3 14h11l3-9H6M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  '%': 'M5 19L19 5M5 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 23a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  'M': 'M16 7a4 4 0 1 0-8 0v12l3-2 1 1 1-1 3 2V7Z',
  'A': 'M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z',
};
</script>

<template>
  <div class="kpi-cards">
    <div
      v-for="(item, idx) in list"
      :key="idx"
      class="kpi-cards__item"
    >
      <!-- 顶部流光 -->
      <span class="kpi-cards__shine" />

      <div class="kpi-cards__icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path :d="ICONS[item.icon] || ''" />
        </svg>
      </div>
      <div class="kpi-cards__body">
        <div class="kpi-cards__label">{{ item.label }}</div>
        <div class="kpi-cards__value">
          <DigitalNumber :value="item.value" />
          <span class="kpi-cards__unit">{{ item.unit }}</span>
        </div>
        <div
          class="kpi-cards__trend"
          :class="item.trend >= 0 ? 'trend-up' : 'trend-down'"
        >
          <span class="kpi-cards__arrow">{{ item.trend >= 0 ? '▲' : '▼' }}</span>
          {{ Math.abs(item.trend).toFixed(1) }}%
          <span class="kpi-cards__trend-hint">较昨日</span>
        </div>
      </div>

      <!-- 底部迷你进度条 -->
      <div class="kpi-cards__bar">
        <div
          class="kpi-cards__bar-fill"
          :style="{ width: `${30 + (idx * 11) % 60}%` }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.kpi-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr 1fr;
  gap: 0.12rem;
  width: 100%;
  height: 100%;

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0.1rem 0.14rem 0.14rem;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.18), rgba(64, 158, 255, 0.04));
    border: 1px solid rgba(64, 158, 255, 0.25);
    border-radius: 0.04rem;
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(76, 243, 255, 0.25);
    }
  }

  &__shine {
    position: absolute;
    top: 0; left: -100%;
    width: 60%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #4cf3ff, transparent);
    animation: cardShine 3s linear infinite;
  }

  &__icon {
    width: 0.46rem;
    height: 0.46rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    margin-right: 0.12rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #4cf3ff, #409eff);
    box-shadow: 0 0 12px rgba(76, 243, 255, 0.45);
    flex-shrink: 0;
  }

  &__body { flex: 1; min-width: 0; }

  &__label {
    font-size: 0.13rem;
    color: rgba(230, 241, 255, 0.6);
    margin-bottom: 0.04rem;
  }

  &__value {
    display: flex;
    align-items: baseline;
    gap: 0.04rem;
    font-size: 0.26rem;
  }
  &__unit { font-size: 0.13rem; color: rgba(230, 241, 255, 0.7); margin-left: 0.04rem; }

  &__trend {
    margin-top: 0.04rem;
    font-size: 0.12rem;
  }
  &__arrow { margin-right: 0.04rem; }
  &__trend-hint { margin-left: 0.04rem; color: rgba(230, 241, 255, 0.45); }

  &__bar {
    position: absolute;
    left: 0.14rem; right: 0.14rem; bottom: 0.06rem;
    height: 2px;
    background: rgba(64, 158, 255, 0.1);
    border-radius: 1px;
    overflow: hidden;
  }
  &__bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #409eff, #4cf3ff);
    box-shadow: 0 0 4px #4cf3ff;
  }
}

@keyframes cardShine {
  0%   { left: -100%; }
  60%  { left: 100%; }
  100% { left: 100%; }
}
</style>
