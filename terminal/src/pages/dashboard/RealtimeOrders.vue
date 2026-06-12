<script lang="ts" setup>
import { ref } from 'vue';
import { getRealtimeOrders } from '../../utils/mockData';
import { useInterval } from '../../hooks/useInterval';

interface Order {
  id: string;
  product: string;
  city: string;
  amount: number;
  status: string;
}

const orders = ref<Order[]>(getRealtimeOrders().slice(0, 10));
const pulseId = ref<string>('');
useInterval(() => {
  const next = getRealtimeOrders()[0];
  // 整体替换：永远只保留 10 条，固定行高 0.32rem → 不会抖动
  orders.value = [next, ...orders.value].slice(0, 10);
  pulseId.value = next.id;
  // 1.2s 后清除 pulse（纯 CSS animation，不影响布局）
  setTimeout(() => {
    if (pulseId.value === next.id) pulseId.value = '';
  }, 1200);
}, 2500);
</script>

<template>
  <div class="realtime-orders">
    <div class="realtime-orders__head">
      <span>订单号</span>
      <span>商品</span>
      <span>城市</span>
      <span class="tr">金额</span>
      <span class="tr">状态</span>
    </div>
    <ul class="realtime-orders__list">
      <li
        v-for="o in orders"
        :key="o.id"
        class="realtime-orders__row"
        :class="{ 'realtime-orders__row--pulse': pulseId === o.id }"
      >
        <span class="ellipsis realtime-orders__id">{{ o.id }}</span>
        <span class="ellipsis">{{ o.product }}</span>
        <span>{{ o.city }}</span>
        <span class="tr text-primary">¥{{ o.amount }}</span>
        <span
          class="tr"
          :class="{
            'text-warning': o.status === '配送中',
            'text-success': o.status === '已完成',
            'text-primary': o.status === '已支付',
          }"
          >{{ o.status }}</span
        >
      </li>
    </ul>
  </div>
</template>

<style lang="less" scoped>
.realtime-orders {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__head,
  &__row {
    display: grid;
    grid-template-columns: 0.95rem 1fr 0.5rem 0.7rem 0.6rem;
    align-items: center;
    gap: 0.04rem;
    height: 0.32rem;
    padding: 0 0.08rem;
    box-sizing: border-box; // 关键：行高固定，避免抖动
  }
  &__head {
    font-size: 0.13rem;
    color: rgba(230, 241, 255, 0.55);
    background: rgba(64, 158, 255, 0.1);
    border-radius: 0.02rem;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  &__row {
    font-size: 0.13rem;
    line-height: 1;
    color: rgba(230, 241, 255, 0.85);
    border-bottom: 1px dashed rgba(64, 158, 255, 0.1);

    &--pulse {
      animation: rowPulse 1.2s ease-out;
    }
  }

  &__id { font-family: 'DIN', monospace; color: rgba(76, 243, 255, 0.8); }

  .tr { text-align: right; }
}

@keyframes rowPulse {
  0%   { background: rgba(76, 243, 255, 0.35); }
  100% { background: transparent; }
}
</style>
