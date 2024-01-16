<template>
  <div class="slide-energy-consumption">滑动能耗组件</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'SlideEnergyConsumption',
  props: {
    uid: {
      type: Number,
      default: null
    }
  },
  setup() {
    return {};
  },
});
</script>

<style lang="less" scoped>
.slide-energy-consumption {
  color: var(--iot-font-color-shadow);
}
</style>