<script lang="ts" setup>
import PanelBox from '../components/PanelBox.vue';
import HeaderBar from './dashboard/HeaderBar.vue';
import KpiCards from './dashboard/KpiCards.vue';
import SalesFunnel from './dashboard/SalesFunnel.vue';
import SourcePie from './dashboard/SourcePie.vue';
import RegionBar from './dashboard/RegionBar.vue';
import ChinaMap from './dashboard/ChinaMap.vue';
import UserTrend from './dashboard/UserTrend.vue';
import ActivityStream from './dashboard/ActivityStream.vue';
import RealtimeOrders from './dashboard/RealtimeOrders.vue';
import TopProducts from './dashboard/TopProducts.vue';
import PayChannelRose from './dashboard/PayChannelRose.vue';

defineOptions({
  name: 'TerminalHome',
});
</script>

<template>
  <div class="dashboard">
    <!-- 背景装饰层 -->
    <div class="dashboard__bg">
      <span class="bg-deco bg-deco--tl" />
      <span class="bg-deco bg-deco--tr" />
      <span class="bg-deco bg-deco--bl" />
      <span class="bg-deco bg-deco--br" />

      <!-- 中心能量脉冲环（持续扩散） -->
      <div class="dashboard__pulse"><span /><span /><span /><span /></div>

      <!-- 浮动粒子 -->
      <span class="dashboard__particle dashboard__particle--1" />
      <span class="dashboard__particle dashboard__particle--2" />
      <span class="dashboard__particle dashboard__particle--3" />
      <span class="dashboard__particle dashboard__particle--4" />
      <span class="dashboard__particle dashboard__particle--5" />
      <span class="dashboard__particle dashboard__particle--6" />

      <!-- 底部横向数据流 -->
      <div class="dashboard__stream dashboard__stream--top" />
      <div class="dashboard__stream dashboard__stream--bottom" />
    </div>

    <HeaderBar class="dashboard__header" />

    <main class="dashboard__body">
      <!-- 左侧：核心指标 / 漏斗 / 来源 / 区域 -->
      <section class="dashboard__col dashboard__col--left">
        <PanelBox title="核心指标" :show-header="false" class="dashboard__kpi">
          <KpiCards />
        </PanelBox>
        <PanelBox title="销售漏斗">
          <SalesFunnel />
        </PanelBox>
        <PanelBox title="业务来源分布">
          <SourcePie />
        </PanelBox>
        <PanelBox title="区域销售 TOP10">
          <RegionBar />
        </PanelBox>
      </section>

      <!-- 中间：全国业务分布地图 / 趋势 / 活动 -->
      <section class="dashboard__col dashboard__col--center">
        <PanelBox title="全国业务分布" class="dashboard__map">
          <ChinaMap />
        </PanelBox>
        <PanelBox title="近 7 日访问与下单趋势">
          <UserTrend />
        </PanelBox>
        <PanelBox title="实时活动动态">
          <ActivityStream />
        </PanelBox>
      </section>

      <!-- 右侧：实时订单 / 排行 / 支付 -->
      <section class="dashboard__col dashboard__col--right">
        <PanelBox title="实时订单流">
          <RealtimeOrders />
        </PanelBox>
        <PanelBox title="热门商品排行">
          <TopProducts />
        </PanelBox>
        <PanelBox title="支付方式占比">
          <PayChannelRose />
        </PanelBox>
      </section>
    </main>
  </div>
</template>

<style lang="less" scoped>
.dashboard {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0.1rem 0.2rem 0.2rem;
  overflow: hidden;
  z-index: 1;

  &__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  // 中心能量脉冲环
  &__pulse {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 0;
    height: 0;

    span {
      position: absolute;
      left: 0;
      top: 0;
      width: 12rem;
      height: 12rem;
      margin-left: -6rem;
      margin-top: -6rem;
      border: 1px solid rgba(76, 243, 255, 0.35);
      border-radius: 50%;
      transform: scale(0.05);
      opacity: 0;
      animation: pulseRing 6s linear infinite;
    }
    span:nth-child(2) {
      animation-delay: 1.5s;
    }
    span:nth-child(3) {
      animation-delay: 3s;
    }
    span:nth-child(4) {
      animation-delay: 4.5s;
    }
  }

  // 浮动粒子
  &__particle {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4cf3ff;
    box-shadow:
      0 0 10px #4cf3ff,
      0 0 20px rgba(76, 243, 255, 0.5);
    opacity: 0.6;
    animation: float 14s ease-in-out infinite;

    &--1 {
      left: 12%;
      top: 22%;
      animation-delay: 0s;
    }
    &--2 {
      left: 22%;
      top: 78%;
      animation-delay: 2s;
    }
    &--3 {
      left: 70%;
      top: 18%;
      animation-delay: 4s;
    }
    &--4 {
      left: 85%;
      top: 60%;
      animation-delay: 6s;
    }
    &--5 {
      left: 50%;
      top: 88%;
      animation-delay: 3s;
    }
    &--6 {
      left: 8%;
      top: 50%;
      animation-delay: 8s;
    }
  }

  // 横向数据流
  &__stream {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(76, 243, 255, 0.7) 30%,
      rgba(64, 158, 255, 0.9) 50%,
      rgba(76, 243, 255, 0.7) 70%,
      transparent 100%
    );
    background-size: 50% 100%;
    background-repeat: repeat-x;
    opacity: 0.45;

    &--top {
      top: 0.65rem;
      animation: stream 8s linear infinite;
    }
    &--bottom {
      bottom: 0.05rem;
      animation: stream 8s linear infinite reverse;
    }
  }

  &__header {
    position: relative;
    z-index: 2;
    flex-shrink: 0;
  }

  &__body {
    position: relative;
    z-index: 2;
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 4.6rem 1fr 4.6rem;
    gap: 0.2rem;
    margin-top: 0.1rem;
  }

  &__col {
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 0.16rem;
    min-width: 0;
    min-height: 0;
  }

  &__col--left {
    grid-template-rows: 2.4fr 2.2fr 2.2fr 2.4fr;
  }
  &__col--right {
    grid-template-rows: 3.4fr 2.8fr 2.6fr;
  }
  &__col--center {
    grid-template-rows: 4.5fr 2.6fr 2.2fr;
  }

  &__kpi {
    background: transparent;
    border: none;
    box-shadow: none;
  }
  &__map {
    background: transparent;
  }
}

@keyframes pulseRing {
  0% {
    transform: scale(0.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
    opacity: 0.4;
  }
  25% {
    transform: translate(20px, -20px);
    opacity: 0.8;
  }
  50% {
    transform: translate(-15px, 15px);
    opacity: 0.5;
  }
  75% {
    transform: translate(10px, 10px);
    opacity: 0.7;
  }
}

@keyframes stream {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 50% 0;
  }
}
</style>
