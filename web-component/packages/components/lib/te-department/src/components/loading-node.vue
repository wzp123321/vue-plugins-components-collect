<!-- 出现在视野中时触发show事件，用于懒加载 -->
<template>
  <div ref="observerTarget">{{ label }}</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from 'vue';

defineProps<{ label: string }>();
const emit = defineEmits(['show']);

const observerTarget = ref<HTMLElement>();

const intersectionObserver = new IntersectionObserver((entries) => {
  if (entries[0].intersectionRatio <= 0) {
    return;
  }
  emit('show');
});

onMounted(async () => {
  await nextTick();
  intersectionObserver.observe(observerTarget.value!);
});

onUnmounted(() => {
  intersectionObserver.disconnect();
});
</script>

<style scoped lang="less"></style>
