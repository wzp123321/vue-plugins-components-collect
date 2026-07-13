<template>
  <div
    class="tptv-item tptv-item-text"
    :style="{
      left: `${item.x}mm`,
      top: `${item.y}mm`,
      width: `${item.width}mm`,
      height: `${item.height}mm`,
    }"
  >
    <span :style="{ fontSize: `${(item as any).fontSize || 4}mm`, color: (item as any).color || '#000' }">
      {{ (item as any).content }}
    </span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ item: any }>();
</script>

<style lang="less" scoped>
.tptv-item-text {
  position: absolute;
  display: flex;
  align-items: center;
  padding: 0 1mm;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
