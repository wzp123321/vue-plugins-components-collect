<template>
  <div class="input-filter">
    <if-text-input-filter></if-text-input-filter>
    <if-number-input-filter></if-number-input-filter>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TextInputFilter from './if-text-filter/if-text-filter.vue';
import NumberInputFilter from './if-number-filter/if-number-filter.vue';

export default defineComponent({
  name: 'InputFilter',
  components: {
    'if-text-input-filter': TextInputFilter,
    'if-number-input-filter': NumberInputFilter,
  },
  setup() {},
});
</script>

<style lang="less" scoped>
.input-filter {
  width: 100%;
  height: 100%;
  padding: 16px;
  background-color: var(--color-default);

  .if-text-filter {
    margin-bottom: 40px;
  }
}
</style>