<template>
  <div
    class="tptv-item tptv-item-image"
    :style="{
      left: `${item.x}mm`,
      top: `${item.y}mm`,
      width: `${item.width}mm`,
      height: `${item.height}mm`,
    }"
  >
    <img v-if="(item as any).src" :src="(item as any).src" :alt="(item as any).alt" />
    <div v-else class="tptv-image-placeholder">图片占位</div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ item: any }>();
</script>

<style lang="less" scoped>
.tptv-item-image {
  position: absolute;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.tptv-image-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 3mm;
  border: 1px dashed #c0c4cc;
}
</style>
