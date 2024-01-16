<template>
  <div class="project-site-overview">项目点位概览</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ProjectSiteOverview',
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
.project-site-overview {
  color: var(--iot-font-color-shadow);
}
</style>