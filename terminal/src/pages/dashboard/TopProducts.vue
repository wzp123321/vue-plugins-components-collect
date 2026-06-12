<script lang="ts" setup>
import { ref } from 'vue';
import { getTopProducts } from '../../utils/mockData';
import { useInterval } from '../../hooks/useInterval';
import { formatNumber } from '../../utils/format';

const list = ref(getTopProducts());
useInterval(() => {
  list.value = getTopProducts();
}, 6000);
</script>

<template>
  <ul class="panel-list top-products">
    <li
      v-for="(item, idx) in list"
      :key="item.name"
      class="panel-list__item top-products__row"
    >
      <span
        class="panel-list__item__rank"
        :class="{ 'panel-list__item__rank--top': idx < 3 }"
      >{{ idx + 1 }}</span>
      <span class="top-products__name ellipsis">{{ item.name }}</span>
      <span class="top-products__sales">{{ formatNumber(item.sales) }}</span>
      <span
        class="top-products__growth"
        :class="item.growth >= 0 ? 'trend-up' : 'trend-down'"
      >{{ item.growth >= 0 ? '+' : '' }}{{ item.growth.toFixed(1) }}%</span>
    </li>
  </ul>
</template>

<style lang="less" scoped>
.top-products {
  &__row {
    display: grid;
    grid-template-columns: 0.34rem 1fr 0.7rem 0.6rem;
    align-items: center;
  }
  &__name { color: rgba(230, 241, 255, 0.9); }
  &__sales {
    color: #4cf3ff;
    font-family: 'DIN', 'Helvetica Neue', Arial, sans-serif;
    font-weight: 600;
    text-align: right;
  }
  &__growth {
    text-align: right;
    font-size: 0.13rem;
  }
}
</style>
