<template>
  <div class="setting-form">
    <div class="setting-form__container">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'SettingFormContainer',
});
</script>
<style lang="less" scoped>
.setting-form {
  border: 1px solid var(--iot-border-color);
  border-radius: 8px;
  background-color: var(----iot-bg-color-component);
  &__container {
    min-height: 200px;
    padding: 24px;
  }
}
</style>
