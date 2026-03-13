<template>
  <div class="empty-404-container">
    <te-empty description="页面找不到了" :image-size="400">
      <template #image>
        <img src="../../assets/img/404.png" />
      </template>
      <te-button type="primary" @click="router.back()">返回</te-button>
    </te-empty>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: '404',
  setup() {
    const router = useRouter();
    return { router };
  },
});
</script>
<style lang="scss" scoped>
.empty-404-container {
  height: 100%;
  width: 100%;
}
</style>
