<template>
  <div class="vue-virtual-scroller" id="vue-virtual-scroller">
    <RecycleScroller class="scroller" :items="items" :item-size="48" key-field="id" v-slot="{ item, index }">
      <div :class="['user', index % 2 === 0 ? '' : 'stripe']">{{ item.label }}--{{ index }}</div>
    </RecycleScroller>
  </div>
</template>
<script lang="ts" setup>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

import { RecycleScroller } from 'vue-virtual-scroller';

let items = [
  {
    id: 1,
    label: 'Title',
    size: 48,
  },
  {
    id: 2,
    label: 'Foo',
    size: 48,
  },
  {
    id: 3,
    label: 'Bar',
    size: 48,
  },
];

for (let i = 0; i < 1000; i++) {
  items.push({
    id: Number((Math.random() * 10000000).toFixed(0)),
    label: (Math.random() * 10000).toFixed(0),
    size: 48,
  });
}
</script>
<style lang="less" scoped>
#vue-virtual-scroller {
  width: 100%;
  height: 100%;

  .scroller {
    height: 100%;
  }

  .user {
    height: 48px;
    line-height: 48px;
    width: 100%;

    padding: 0 12px;
    display: flex;
    align-items: center;
  }
  .vue-recycle-scroller__item-view > .user.stripe {
    background-color: rgba(0, 0, 0, 0.08);
  }
}
</style>
